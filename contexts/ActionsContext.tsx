// ActionsContext - Manages Today's Actions state and rule evaluation
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useFarm } from './FarmContext';
import { useAuth } from './AuthContext';
import { actionRulesService, triggeredActionsService, batchesService, dailyLogsService, inventoryService, tasksService, healthSchedulesService, farmsService } from '../services/database';
import { evaluateRules, type RuleContext, type TriggeredActionWithRule } from '../services/ruleEngine';
import type { Tables, Sector } from '../types/database';

interface ActionsContextType {
    actions: TriggeredActionWithRule[];
    loading: boolean;
    error: Error | null;
    refreshActions: () => Promise<void>;
    dismissAction: (actionId: string) => Promise<void>;
    snoozeAction: (actionId: string, hours: number) => Promise<void>;
    resolveAction: (actionId: string) => Promise<void>;
    getActionsBySector: (sector: Sector | null) => TriggeredActionWithRule[];
    getTodaysTopAction: () => TriggeredActionWithRule | null;
}

const ActionsContext = createContext<ActionsContextType | undefined>(undefined);

export function ActionsProvider({ children }: { children: React.ReactNode }) {
    const { activeFarm } = useFarm();
    const { user } = useAuth();

    const [actions, setActions] = useState<TriggeredActionWithRule[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Evaluate rules and update triggered actions
    const refreshActions = useCallback(async () => {
        if (!activeFarm || !user) {
            setActions([]);
            setLoading(false);
            return;
        }

        // Convert activeFarm to Tables<'farms'> format
        const farmId = String(activeFarm.id);

        try {
            setLoading(true);
            setError(null);

            // Fetch active rules
            const rules = await actionRulesService.list();

            // Fetch existing triggered actions
            const existingActions = await triggeredActionsService.getActiveForFarm(farmId);

            // Fetch all data needed for rule evaluation
            const [batches, dailyLogs, inventory, tasks, allHealthSchedules] = await Promise.all([
                batchesService.list(farmId),
                dailyLogsService.list(farmId),
                inventoryService.list(farmId),
                tasksService.list(farmId),
                // Fetch health schedules for all batches
                batchesService.list(farmId).then(async (batches) => {
                    const schedules = await Promise.all(
                        batches.map(b => healthSchedulesService.list(b.id))
                    );
                    return schedules.flat();
                })
            ]);

            // Build context for rule evaluation (need to fetch full farm data)
            const dbFarms = await farmsService.list();
            const currentFarm = dbFarms.find(f => f.id === farmId);
            if (!currentFarm) throw new Error('Farm not found');

            const context: RuleContext = {
                farm: currentFarm,
                batches,
                dailyLogs,
                inventory,
                tasks,
                healthSchedules: allHealthSchedules
            };

            // Evaluate rules
            const newTriggers = evaluateRules(
                rules,
                context,
                existingActions as unknown as Tables<'triggered_actions'>[]
            );

            // Create new triggered actions
            for (const trigger of newTriggers) {
                await triggeredActionsService.create({
                    farm_id: farmId,
                    rule_id: trigger.rule.id,
                    batch_id: trigger.batchId || null,
                    metadata: trigger.metadata || {}
                });
            }

            // Fetch updated actions list
            const updatedActions = await triggeredActionsService.getActiveForFarm(farmId);
            setActions(updatedActions as unknown as TriggeredActionWithRule[]);

        } catch (err) {
            console.error('Error refreshing actions:', err);
            setError(err instanceof Error ? err : new Error('Failed to refresh actions'));
        } finally {
            setLoading(false);
        }
    }, [activeFarm, user]);

    // Initial load and refresh when dependencies change
    useEffect(() => {
        refreshActions();
    }, [refreshActions]);

    // Dismiss an action
    const dismissAction = useCallback(async (actionId: string) => {
        try {
            await triggeredActionsService.dismiss(actionId);
            setActions(prev => prev.filter(a => a.id !== actionId));
        } catch (err) {
            console.error('Error dismissing action:', err);
            throw err;
        }
    }, []);

    // Snooze an action
    const snoozeAction = useCallback(async (actionId: string, hours: number) => {
        try {
            await triggeredActionsService.snooze(actionId, hours);
            setActions(prev => prev.filter(a => a.id !== actionId));
        } catch (err) {
            console.error('Error snoozing action:', err);
            throw err;
        }
    }, []);

    // Resolve an action
    const resolveAction = useCallback(async (actionId: string) => {
        try {
            await triggeredActionsService.resolve(actionId);
            setActions(prev => prev.filter(a => a.id !== actionId));
        } catch (err) {
            console.error('Error resolving action:', err);
            throw err;
        }
    }, []);

    // Get actions filtered by sector
    const getActionsBySector = useCallback((sector: Sector | null) => {
        if (!sector) return actions;
        return actions.filter(a => a.rule.sector === sector || a.rule.sector === null);
    }, [actions]);

    // Get top priority action for today's card
    const getTodaysTopAction = useCallback(() => {
        if (actions.length === 0) return null;

        // Already sorted by severity in rule engine
        // Critical > Warning > Info
        return actions[0];
    }, [actions]);

    const value: ActionsContextType = {
        actions,
        loading,
        error,
        refreshActions,
        dismissAction,
        snoozeAction,
        resolveAction,
        getActionsBySector,
        getTodaysTopAction
    };

    return (
        <ActionsContext.Provider value={value}>
            {children}
        </ActionsContext.Provider>
    );
}

export function useActions() {
    const context = useContext(ActionsContext);
    if (context === undefined) {
        throw new Error('useActions must be used within an ActionsProvider');
    }
    return context;
}
