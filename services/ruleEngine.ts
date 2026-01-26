// Rule Engine Service
// Evaluates farm data against action rules to generate recommendations

import type { Tables, Sector, ActionSeverity, ConditionType } from '../types/database';

// Context passed to rule evaluation
export interface RuleContext {
    farm: Tables<'farms'>;
    batches: Tables<'batches'>[];
    dailyLogs: Tables<'daily_logs'>[];
    inventory: Tables<'inventory_items'>[];
    tasks: Tables<'tasks'>[];
    healthSchedules: Tables<'health_schedules'>[];
}

// Triggered action with joined rule data
export interface TriggeredActionWithRule {
    id: string;
    farm_id: string;
    rule_id: string;
    batch_id: string | null;
    triggered_at: string;
    status: string;
    snoozed_until: string | null;
    resolved_at: string | null;
    metadata: Record<string, any>;
    rule: {
        rule_key: string;
        title: string;
        description: string;
        action_text: string;
        sector: Sector | null;
        severity: ActionSeverity;
    };
}

// Result of evaluating a single rule
interface RuleEvaluationResult {
    shouldTrigger: boolean;
    batchId?: string;
    metadata?: Record<string, any>;
}

// Calculate weeks since start date
export function calculateAgeInWeeks(startDate: string | null, createdAt?: string): number | null {
    if (!startDate && !createdAt) return null;

    const dateToUse = startDate || createdAt;
    if (!dateToUse) return null;

    const start = new Date(dateToUse);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
}

// Parse age string to weeks (fallback for legacy data)
export function parseAgeToWeeks(age: string | null): number | null {
    if (!age) return null;

    const match = age.match(/(\d+)\s*(week|wk|w|day|d|month|mo|m)/i);
    if (!match) return null;

    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    if (unit.startsWith('w')) return value;
    if (unit.startsWith('d')) return Math.floor(value / 7);
    if (unit.startsWith('mo') || unit === 'm') return value * 4;

    return null;
}

// Get batch age in weeks (prefer start_date, fallback to string parsing)
export function getBatchAgeInWeeks(batch: Tables<'batches'>): number | null {
    // First try start_date
    if (batch.start_date) {
        return calculateAgeInWeeks(batch.start_date);
    }

    // Fallback to parsing age string
    return parseAgeToWeeks(batch.age);
}

// Condition evaluators
const conditionEvaluators: Record<ConditionType, (
    rule: Tables<'action_rules'>,
    context: RuleContext
) => RuleEvaluationResult[]> = {

    inventory_below_threshold: (rule, context) => {
        const params = rule.condition_params as { category?: string };
        const results: RuleEvaluationResult[] = [];

        context.inventory.forEach(item => {
            if (params.category && item.category !== params.category) return;

            if (item.quantity <= item.min_threshold) {
                results.push({
                    shouldTrigger: true,
                    metadata: {
                        itemName: item.name,
                        quantity: item.quantity,
                        threshold: item.min_threshold,
                        category: item.category
                    }
                });
            }
        });

        return results;
    },

    days_since_last_log: (rule, context) => {
        const params = rule.condition_params as { days: number };
        const threshold = params.days || 2;

        if (context.dailyLogs.length === 0) {
            return [{
                shouldTrigger: true,
                metadata: { daysSinceLastLog: 'never' }
            }];
        }

        const latestLog = context.dailyLogs.sort((a, b) =>
            new Date(b.log_date).getTime() - new Date(a.log_date).getTime()
        )[0];

        const daysSince = Math.floor(
            (Date.now() - new Date(latestLog.log_date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysSince > threshold) {
            return [{
                shouldTrigger: true,
                metadata: { daysSinceLastLog: daysSince, lastLogDate: latestLog.log_date }
            }];
        }

        return [];
    },

    mortality_rate: (rule, context) => {
        const params = rule.condition_params as { threshold_percent: number; hours: number };
        const results: RuleEvaluationResult[] = [];

        // Check each batch for high mortality
        context.batches.forEach(batch => {
            if (rule.sector && batch.sector !== rule.sector) return;

            // Get logs for this batch in the last N hours
            const cutoffTime = Date.now() - (params.hours || 24) * 60 * 60 * 1000;
            const recentLogs = context.dailyLogs.filter(log =>
                log.batch_id === batch.id &&
                new Date(log.log_date).getTime() > cutoffTime
            );

            // Sum mortality from activities
            let totalMortality = 0;
            recentLogs.forEach(log => {
                const activities = log.activities as Record<string, any>;
                if (activities?.mortality) {
                    totalMortality += Number(activities.mortality) || 0;
                }
            });

            const mortalityPercent = (totalMortality / batch.stock_count) * 100;

            if (mortalityPercent > (params.threshold_percent || 2)) {
                results.push({
                    shouldTrigger: true,
                    batchId: batch.id,
                    metadata: {
                        batchName: batch.name,
                        mortality: totalMortality,
                        stockCount: batch.stock_count,
                        mortalityPercent: mortalityPercent.toFixed(2)
                    }
                });
            }
        });

        return results;
    },

    health_schedule_due: (rule, context) => {
        const params = rule.condition_params as { days_tolerance?: number };
        const daysTolerance = params.days_tolerance || 0;
        const results: RuleEvaluationResult[] = [];

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

        context.healthSchedules.forEach(schedule => {
            // Skip completed vaccinations
            if (schedule.completed) return;

            // Skip universal templates (they don't have batch_id or scheduled_date)
            if (schedule.is_universal || !schedule.scheduled_date || !schedule.batch_id) return;

            const scheduleDate = new Date(schedule.scheduled_date);
            scheduleDate.setHours(0, 0, 0, 0);

            // Calculate days difference
            const daysDiff = Math.floor((scheduleDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            // Trigger if vaccination is due today, overdue, or within tolerance
            if (daysDiff <= daysTolerance) {
                const batch = context.batches.find(b => b.id === schedule.batch_id);
                const isOverdue = daysDiff < 0;
                // Use schedule.sector if available, otherwise fallback to batch.sector
                const taskSector = schedule.sector || batch?.sector;

                results.push({
                    shouldTrigger: true,
                    batchId: schedule.batch_id,
                    metadata: {
                        vaccine: schedule.vaccine_name,
                        scheduledDate: schedule.scheduled_date,
                        batchName: batch?.name || 'Unknown',
                        sector: taskSector, // Use schedule sector or batch sector
                        dayNumber: schedule.day_number,
                        dosage: schedule.dosage,
                        method: schedule.administration_method,
                        isCompulsory: schedule.is_compulsory,
                        isOverdue: isOverdue,
                        daysOverdue: isOverdue ? Math.abs(daysDiff) : 0
                    }
                });
            }
        });

        return results;
    },

    age_in_weeks: (rule, context) => {
        const params = rule.condition_params as { min_weeks: number; max_weeks: number; message?: string };
        const results: RuleEvaluationResult[] = [];

        context.batches.forEach(batch => {
            if (rule.sector && batch.sector !== rule.sector) return;
            if (batch.status !== 'Active') return;

            const ageInWeeks = getBatchAgeInWeeks(batch);
            if (ageInWeeks === null) return;

            if (ageInWeeks >= params.min_weeks && ageInWeeks <= params.max_weeks) {
                results.push({
                    shouldTrigger: true,
                    batchId: batch.id,
                    metadata: {
                        batchName: batch.name,
                        ageInWeeks,
                        minWeeks: params.min_weeks,
                        maxWeeks: params.max_weeks,
                        message: params.message
                    }
                });
            }
        });

        return results;
    },

    egg_production_drop: (rule, context) => {
        const params = rule.condition_params as { drop_percent: number; days: number };
        const results: RuleEvaluationResult[] = [];

        context.batches.forEach(batch => {
            if (batch.sector !== 'Layer') return;
            if (batch.status !== 'Active') return;

            // Get logs for this batch in the specified period
            const daysToCheck = params.days || 3;
            const cutoffTime = Date.now() - daysToCheck * 24 * 60 * 60 * 1000;

            const recentLogs = context.dailyLogs
                .filter(log => log.batch_id === batch.id && new Date(log.log_date).getTime() > cutoffTime)
                .sort((a, b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());

            if (recentLogs.length < 2) return;

            // Check for production drop
            const firstLog = recentLogs[0];
            const lastLog = recentLogs[recentLogs.length - 1];

            const firstActivities = firstLog.activities as Record<string, any>;
            const lastActivities = lastLog.activities as Record<string, any>;

            const firstProduction = Number(firstActivities?.eggsCollected || firstActivities?.eggs_collected || 0);
            const lastProduction = Number(lastActivities?.eggsCollected || lastActivities?.eggs_collected || 0);

            if (firstProduction > 0) {
                const dropPercent = ((firstProduction - lastProduction) / firstProduction) * 100;

                if (dropPercent > (params.drop_percent || 10)) {
                    results.push({
                        shouldTrigger: true,
                        batchId: batch.id,
                        metadata: {
                            batchName: batch.name,
                            dropPercent: dropPercent.toFixed(1),
                            previousProduction: firstProduction,
                            currentProduction: lastProduction
                        }
                    });
                }
            }
        });

        return results;
    },

    weight_below_expected: (rule, context) => {
        const params = rule.condition_params as { weights_by_week: Record<number, number>; tolerance_percent?: number };
        const results: RuleEvaluationResult[] = [];

        context.batches.forEach(batch => {
            if (batch.sector !== 'Broiler') return;
            if (batch.status !== 'Active') return;

            const ageInWeeks = getBatchAgeInWeeks(batch);
            if (ageInWeeks === null) return;

            const expectedWeight = params.weights_by_week?.[ageInWeeks];
            if (!expectedWeight) return;

            // Get latest log with weight data
            const batchLogs = context.dailyLogs
                .filter(log => log.batch_id === batch.id)
                .sort((a, b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime());

            if (batchLogs.length === 0) return;

            const latestLog = batchLogs[0];
            const activities = latestLog.activities as Record<string, any>;
            const actualWeight = Number(activities?.avgWeight || activities?.averageWeight || activities?.weight || 0);

            if (actualWeight > 0) {
                const tolerance = params.tolerance_percent || 15;
                const minWeight = expectedWeight * (1 - tolerance / 100);

                if (actualWeight < minWeight) {
                    results.push({
                        shouldTrigger: true,
                        batchId: batch.id,
                        metadata: {
                            batchName: batch.name,
                            ageInWeeks,
                            actualWeight,
                            expectedWeight,
                            percentBelow: (((expectedWeight - actualWeight) / expectedWeight) * 100).toFixed(1)
                        }
                    });
                }
            }
        });

        return results;
    },

    task_overdue: (rule, context) => {
        const results: RuleEvaluationResult[] = [];
        const now = new Date();

        context.tasks.forEach(task => {
            if (task.status === 'completed') return;
            if (!task.due_date) return;

            const dueDate = new Date(task.due_date);
            if (dueDate < now) {
                results.push({
                    shouldTrigger: true,
                    metadata: {
                        taskTitle: task.title,
                        dueDate: task.due_date,
                        daysOverdue: Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
                    }
                });
            }
        });

        return results;
    },

    batch_missing_start_date: (rule, context) => {
        const results: RuleEvaluationResult[] = [];

        context.batches.forEach(batch => {
            if (batch.status !== 'Active') return;
            if (rule.sector && batch.sector !== rule.sector) return;

            if (!batch.start_date) {
                results.push({
                    shouldTrigger: true,
                    batchId: batch.id,
                    metadata: {
                        batchName: batch.name,
                        sector: batch.sector
                    }
                });
            }
        });

        return results;
    }
};

// Main function to evaluate all rules
export function evaluateRules(
    rules: Tables<'action_rules'>[],
    context: RuleContext,
    existingActions: Tables<'triggered_actions'>[]
): Array<{
    rule: Tables<'action_rules'>;
    batchId?: string;
    metadata?: Record<string, any>;
}> {
    const results: Array<{
        rule: Tables<'action_rules'>;
        batchId?: string;
        metadata?: Record<string, any>;
    }> = [];

    // Create a set of existing active action keys for quick lookup
    const existingKeys = new Set(
        existingActions
            .filter(a => a.status === 'active')
            .map(a => `${a.rule_id}-${a.batch_id || 'null'}`)
    );

    for (const rule of rules) {
        if (!rule.is_active) continue;

        // Check if rule applies to any batch sector
        if (rule.sector) {
            const hasMatchingSector = context.batches.some(b => b.sector === rule.sector);
            if (!hasMatchingSector) continue;
        }

        const evaluator = conditionEvaluators[rule.condition_type as ConditionType];
        if (!evaluator) {
            console.warn(`Unknown condition type: ${rule.condition_type}`);
            continue;
        }

        try {
            const evaluationResults = evaluator(rule, context);

            for (const result of evaluationResults) {
                if (result.shouldTrigger) {
                    const actionKey = `${rule.id}-${result.batchId || 'null'}`;

                    // Don't trigger if already active
                    if (!existingKeys.has(actionKey)) {
                        results.push({
                            rule,
                            batchId: result.batchId,
                            metadata: result.metadata
                        });
                    }
                }
            }
        } catch (error) {
            console.error(`Error evaluating rule ${rule.rule_key}:`, error);
        }
    }

    // Sort by severity (critical first, then warning, then info)
    const severityOrder: Record<ActionSeverity, number> = {
        critical: 0,
        warning: 1,
        info: 2
    };

    results.sort((a, b) =>
        severityOrder[a.rule.severity] - severityOrder[b.rule.severity]
    );

    return results;
}
