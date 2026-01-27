// @ts-nocheck
// Database service layer for Supabase CRUD operations
// Using @ts-nocheck due to complex Supabase generics/type inference issues
// Return types are still properly typed for consumers of this service

import { supabase } from '../lib/supabase';
import type { Tables, Insertable, Updatable } from '../types/database';

// ============================================
// FARMS
// ============================================

export const farmsService = {
    async list() {
        const { data, error } = await supabase
            .from('farms')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as Tables<'farms'>[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('farms')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Tables<'farms'>;
    },

    async create(farm: Insertable<'farms'>) {
        const { data, error } = await supabase
            .from('farms')
            .insert(farm as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'farms'>;
    },

    async update(id: string, farm: Updatable<'farms'>) {
        const { data, error } = await supabase
            .from('farms')
            .update(farm as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'farms'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('farms')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// BATCHES
// ============================================

export const batchesService = {
    async list(farmId?: string) {
        let query = supabase
            .from('batches')
            .select('*')
            .order('created_at', { ascending: false });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'batches'>[];
    },

    async create(batch: Insertable<'batches'>) {
        const { data, error } = await supabase
            .from('batches')
            .insert(batch as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'batches'>;
    },

    async update(id: string, batch: Updatable<'batches'>) {
        const { data, error } = await supabase
            .from('batches')
            .update(batch as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'batches'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('batches')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// TASKS
// ============================================

export const tasksService = {
    async list(farmId?: string) {
        let query = supabase
            .from('tasks')
            .select('id, title, status, assigned_to, due_date, recurring, notes, farm_id, created_at, created_by')
            .order('created_at', { ascending: false });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'tasks'>[];
    },

    async create(task: Insertable<'tasks'>) {
        const { data, error } = await supabase
            .from('tasks')
            .insert(task as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'tasks'>;
    },

    async update(id: string, task: Updatable<'tasks'>) {
        const { data, error } = await supabase
            .from('tasks')
            .update(task as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'tasks'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// SALES
// ============================================

export const salesService = {
    async list(farmId?: string) {
        let query = supabase
            .from('sales')
            .select('*')
            .order('sale_date', { ascending: false });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'sales'>[];
    },

    async create(sale: Insertable<'sales'>) {
        const { data, error } = await supabase
            .from('sales')
            .insert(sale as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'sales'>;
    },

    async update(id: string, sale: Updatable<'sales'>) {
        const { data, error } = await supabase
            .from('sales')
            .update(sale as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'sales'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('sales')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// INVENTORY ITEMS
// ============================================

export const inventoryService = {
    async list(farmId?: string) {
        let query = supabase
            .from('inventory_items')
            .select('*')
            .order('created_at', { ascending: false });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'inventory_items'>[];
    },

    async create(item: Insertable<'inventory_items'>) {
        const { data, error } = await supabase
            .from('inventory_items')
            .insert(item as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'inventory_items'>;
    },

    async update(id: string, item: Updatable<'inventory_items'>) {
        const { data, error } = await supabase
            .from('inventory_items')
            .update(item as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'inventory_items'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('inventory_items')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// TRANSACTIONS (for inventory)
// ============================================

export const transactionsService = {
    async list(itemId: string) {
        const { data, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('item_id', itemId)
            .order('transaction_date', { ascending: false });

        if (error) throw error;
        return (data || []) as Tables<'transactions'>[];
    },

    async create(transaction: Insertable<'transactions'>) {
        const { data, error } = await supabase
            .from('transactions')
            .insert(transaction as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'transactions'>;
    },
};

// ============================================
// SUPPLIERS
// ============================================

export const suppliersService = {
    async list(farmId?: string) {
        let query = supabase
            .from('suppliers')
            .select('*')
            .order('name', { ascending: true });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'suppliers'>[];
    },

    async create(supplier: Insertable<'suppliers'>) {
        const { data, error } = await supabase
            .from('suppliers')
            .insert(supplier as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'suppliers'>;
    },

    async update(id: string, supplier: Updatable<'suppliers'>) {
        const { data, error } = await supabase
            .from('suppliers')
            .update(supplier as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'suppliers'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('suppliers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// DAILY LOGS
// ============================================

export const dailyLogsService = {
    async list(farmId?: string, batchId?: string) {
        let query = supabase
            .from('daily_logs')
            .select('*')
            .order('log_date', { ascending: false });

        if (farmId) {
            query = query.eq('farm_id', farmId);
        }
        if (batchId) {
            query = query.eq('batch_id', batchId);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'daily_logs'>[];
    },

    async create(log: Insertable<'daily_logs'>) {
        const { data, error } = await supabase
            .from('daily_logs')
            .insert(log as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'daily_logs'>;
    },

    async update(id: string, log: Updatable<'daily_logs'>) {
        const { data, error } = await supabase
            .from('daily_logs')
            .update(log as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'daily_logs'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('daily_logs')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },
};

// ============================================
// HEALTH SCHEDULES
// ============================================

export const healthSchedulesService = {
    // Get all universal templates (available to all users)
    async listUniversal(sector?: string) {
        let query = supabase
            .from('health_schedules')
            .select('*')
            .eq('is_universal', true)
            .order('day_number', { ascending: true });

        if (sector) {
            query = query.eq('sector', sector);
        }

        const { data, error } = await query;
        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Get schedules for a specific batch
    async listForBatch(batchId: string) {
        const { data, error } = await supabase
            .from('health_schedules')
            .select('*')
            .eq('batch_id', batchId)
            .eq('is_universal', false)
            .order('scheduled_date', { ascending: true });

        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Legacy list method for backwards compatibility
    async list(batchId: string) {
        return this.listForBatch(batchId);
    },

    async create(schedule: Insertable<'health_schedules'>) {
        const { data, error } = await supabase
            .from('health_schedules')
            .insert(schedule as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'health_schedules'>;
    },

    async update(id: string, schedule: Updatable<'health_schedules'>) {
        const { data, error } = await supabase
            .from('health_schedules')
            .update(schedule as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'health_schedules'>;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('health_schedules')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async toggleComplete(id: string, completed: boolean) {
        return this.update(id, { completed: !completed });
    },

    // Mark a task as complete with completion date
    async markComplete(id: string, completedDate?: string) {
        // Note: completed_date column requires migration 020 to be applied
        // For now, just update the completed boolean
        return this.update(id, {
            completed: true
        });
    },

    // Mark a task as incomplete
    async markIncomplete(id: string) {
        return this.update(id, {
            completed: false
        });
    },

    // Add a custom health task to a batch
    async addCustomTask(batchId: string, taskData: {
        vaccine_name: string;
        day_number?: number;
        scheduled_date?: string;
        dosage?: string;
        administration_method?: string;
        notes?: string;
        is_compulsory?: boolean;
        sector?: string;
    }) {
        const schedule: any = {
            batch_id: batchId,
            vaccine_name: taskData.vaccine_name,
            scheduled_date: taskData.scheduled_date || null,
            day_number: taskData.day_number || null,
            dosage: taskData.dosage || null,
            administration_method: taskData.administration_method || null,
            notes: taskData.notes || null,
            is_compulsory: taskData.is_compulsory || false,
            sector: taskData.sector || null,
            completed: false,
            is_universal: false,
            // Note: is_user_template and created_by columns require migration 020 to be applied
        };

        return this.create(schedule);
    },

    // List user's custom templates
    async listUserTemplates(userId: string) {
        const { data, error } = await supabase
            .from('health_schedules')
            .select('*')
            .eq('is_user_template', true)
            .eq('created_by', userId)
            .order('template_name', { ascending: true });

        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Get tasks for a specific user template
    async getTemplateItems(templateName: string, userId: string) {
        const { data, error } = await supabase
            .from('health_schedules')
            .select('*')
            .eq('is_user_template', true)
            .eq('template_name', templateName)
            .eq('created_by', userId)
            .order('day_number', { ascending: true });

        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Create a user template task
    async createTemplateTask(userId: string, templateName: string, taskData: {
        vaccine_name: string;
        day_number: number;
        dosage?: string;
        administration_method?: string;
        notes?: string;
        is_compulsory?: boolean;
        sector: string;
    }) {
        const schedule: any = {
            vaccine_name: taskData.vaccine_name,
            day_number: taskData.day_number,
            dosage: taskData.dosage || null,
            administration_method: taskData.administration_method || null,
            notes: taskData.notes || null,
            is_compulsory: taskData.is_compulsory || false,
            sector: taskData.sector,
            is_universal: false,
            is_user_template: true,
            template_name: templateName,
            created_by: userId,
            batch_id: null,
            completed: false,
        };

        return this.create(schedule);
    },

    // Delete all tasks in a user template
    async deleteTemplate(templateName: string, userId: string) {
        const { error } = await supabase
            .from('health_schedules')
            .delete()
            .eq('is_user_template', true)
            .eq('template_name', templateName)
            .eq('created_by', userId);

        if (error) throw error;
    },

    // Copy universal template to a specific batch
    async copyTemplateToBatch(templateSector: string, batchId: string, startDate: string) {
        // Fetch universal templates for the sector
        const templates = await this.listUniversal(templateSector);

        // Convert start date to Date object
        const batchStartDate = new Date(startDate);

        // Create batch-specific schedules from templates
        const scheduleInserts = templates.map(template => ({
            batch_id: batchId,
            vaccine_name: template.vaccine_name,
            scheduled_date: new Date(
                batchStartDate.getTime() + (template.day_number! - 1) * 24 * 60 * 60 * 1000
            ).toISOString().split('T')[0],
            completed: false,
            notes: template.notes,
            is_universal: false,
            sector: template.sector,
            day_number: template.day_number,
            is_compulsory: template.is_compulsory,
            dosage: template.dosage,
            administration_method: template.administration_method,
        }));

        // Insert all schedules
        const { data, error } = await supabase
            .from('health_schedules')
            .insert(scheduleInserts as any)
            .select();

        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Copy user template to a specific batch
    async copyUserTemplateToBatch(templateName: string, userId: string, batchId: string, startDate: string) {
        // Fetch user template tasks
        const templates = await this.getTemplateItems(templateName, userId);

        if (templates.length === 0) {
            throw new Error('Template not found or has no tasks');
        }

        // Convert start date to Date object
        const batchStartDate = new Date(startDate);

        // Create batch-specific schedules from templates
        const scheduleInserts = templates.map(template => ({
            batch_id: batchId,
            vaccine_name: template.vaccine_name,
            scheduled_date: new Date(
                batchStartDate.getTime() + (template.day_number! - 1) * 24 * 60 * 60 * 1000
            ).toISOString().split('T')[0],
            completed: false,
            notes: template.notes,
            is_universal: false,
            is_user_template: false,
            sector: template.sector,
            day_number: template.day_number,
            is_compulsory: template.is_compulsory,
            dosage: template.dosage,
            administration_method: template.administration_method,
        }));

        // Insert all schedules
        const { data, error } = await supabase
            .from('health_schedules')
            .insert(scheduleInserts as any)
            .select();

        if (error) throw error;
        return (data || []) as Tables<'health_schedules'>[];
    },

    // Calculate batch age in days
    async getBatchAge(batchId: string): Promise<number | null> {
        const { data: batch, error } = await supabase
            .from('batches')
            .select('start_date')
            .eq('id', batchId)
            .single();

        if (error || !batch || !batch.start_date) return null;

        const startDate = new Date(batch.start_date);
        const today = new Date();
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        return diffDays + 1; // +1 because day 1 starts on start_date
    },
};

// ============================================
// FARM MEMBERS
// ============================================

export const farmMembersService = {
    async list(farmId: string) {
        const { data, error } = await supabase
            .from('farm_members')
            .select(`
                id,
                farm_id,
                user_id,
                role,
                joined_at,
                user:users (
                    id,
                    email,
                    full_name
                )
            `)
            .eq('farm_id', farmId);

        if (error) throw error;
        return data;
    },

    async invite(email: string, farmId: string, role: string, invitedBy: string) {
        // First check if user with this email already exists
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();

        if (existingUser && !userError) {
            // User exists - add them directly to farm_members
            // Check if they're already a member
            const { data: existingMember } = await supabase
                .from('farm_members')
                .select('id')
                .eq('farm_id', farmId)
                .eq('user_id', existingUser.id)
                .single();

            if (existingMember) {
                throw new Error("This user is already a member of this farm");
            }

            const { data, error } = await supabase
                .from('farm_members')
                .insert({
                    farm_id: farmId,
                    user_id: existingUser.id,
                    role
                } as any)
                .select()
                .single();

            if (error) throw error;
            return { type: 'added', data };
        }

        // User doesn't exist - create a pending invite
        // First check if there's already a pending invite for this email
        const { data: existingInvite } = await supabase
            .from('invites')
            .select('id')
            .eq('farm_id', farmId)
            .eq('email', email.toLowerCase())
            .eq('status', 'pending')
            .single();

        if (existingInvite) {
            throw new Error("An invite has already been sent to this email");
        }

        const { data: invite, error: inviteError } = await supabase
            .from('invites')
            .insert({
                farm_id: farmId,
                email: email.toLowerCase(),
                role,
                invited_by: invitedBy,
                status: 'pending'
            } as any)
            .select()
            .single();

        if (inviteError) throw inviteError;
        return { type: 'invited', data: invite };
    },

    async updateRole(memberId: string, role: string) {
        const { data, error } = await supabase
            .from('farm_members')
            .update({ role } as any)
            .eq('id', memberId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async remove(memberId: string) {
        const { error } = await supabase
            .from('farm_members')
            .delete()
            .eq('id', memberId);

        if (error) throw error;
    },
};

// ============================================
// INVITES (Pending Team Member Invitations)
// ============================================

export const invitesService = {
    // List pending invites for a farm
    async listForFarm(farmId: string) {
        const { data, error } = await supabase
            .from('invites')
            .select(`
                id,
                email,
                role,
                invited_at,
                status,
                invited_by,
                inviter:users!invited_by (
                    full_name,
                    email
                )
            `)
            .eq('farm_id', farmId)
            .eq('status', 'pending')
            .order('invited_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Cancel a pending invite
    async cancel(inviteId: string) {
        const { data, error } = await supabase
            .from('invites')
            .update({ status: 'cancelled' } as any)
            .eq('id', inviteId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get pending invites for an email (used during signup)
    async getForEmail(email: string) {
        const { data, error } = await supabase
            .from('invites')
            .select(`
                id,
                farm_id,
                role,
                status,
                farm:farms (
                    id,
                    name
                )
            `)
            .eq('email', email.toLowerCase())
            .eq('status', 'pending');

        if (error) throw error;
        return data || [];
    },

    // Process pending invites for a user (called after signup/login)
    async processForUser(userId: string, email: string) {
        // Get all pending invites for this email
        const pendingInvites = await this.getForEmail(email);

        const results = [];
        for (const invite of pendingInvites) {
            try {
                // Add user to the farm
                const { error: memberError } = await supabase
                    .from('farm_members')
                    .insert({
                        farm_id: invite.farm_id,
                        user_id: userId,
                        role: invite.role
                    } as any);

                if (memberError) throw memberError;

                // Mark invite as accepted
                await supabase
                    .from('invites')
                    .update({
                        status: 'accepted',
                        accepted_at: new Date().toISOString()
                    } as any)
                    .eq('id', invite.id);

                results.push({ invite, success: true });
            } catch (err) {
                console.error('Error processing invite:', err);
                results.push({ invite, success: false, error: err });
            }
        }

        return results;
    },
};

// ============================================
// COMMUNITY TIPS
// ============================================

export const tipsService = {
    async list(sector: string) {
        const { data, error } = await supabase
            .from('tips')
            .select('*')
            .eq('sector', sector)
            .order('votes', { ascending: false });

        if (error) throw error;
        return (data || []) as Tables<'tips'>[];
    },

    async create(tip: Insertable<'tips'>) {
        const { data, error } = await supabase
            .from('tips')
            .insert(tip as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'tips'>;
    },

    async vote(tipId: string, userId: string, voteType: number) {
        const { error } = await supabase
            .from('tip_votes')
            .upsert({ tip_id: tipId, user_id: userId, vote_type: voteType });

        if (error) throw error;
    },

    async getUserVotes(userId: string) {
        const { data, error } = await supabase
            .from('tip_votes')
            .select('*')
            .eq('user_id', userId);

        if (error) throw error;
        return (data || []) as Tables<'tip_votes'>[];
    }
};

// ============================================
// ACTION RULES (Today's Actions)
// ============================================

export const actionRulesService = {
    async list() {
        const { data, error } = await supabase
            .from('action_rules')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []) as Tables<'action_rules'>[];
    },

    async getById(id: string) {
        const { data, error } = await supabase
            .from('action_rules')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Tables<'action_rules'>;
    },

    async create(rule: Insertable<'action_rules'>) {
        const { data, error } = await supabase
            .from('action_rules')
            .insert(rule as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'action_rules'>;
    },

    async update(id: string, rule: Updatable<'action_rules'>) {
        const { data, error } = await supabase
            .from('action_rules')
            .update(rule as any)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'action_rules'>;
    }
};

// ============================================
// TRIGGERED ACTIONS
// ============================================

export const triggeredActionsService = {
    async getActiveForFarm(farmId: string) {
        const { data, error } = await supabase
            .from('triggered_actions')
            .select(`
                *,
                rule:action_rules (
                    rule_key,
                    title,
                    description,
                    action_text,
                    sector,
                    severity
                )
            `)
            .eq('farm_id', farmId)
            .eq('status', 'active')
            .order('triggered_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(action: Insertable<'triggered_actions'>) {
        const { data, error } = await supabase
            .from('triggered_actions')
            .insert(action as any)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'triggered_actions'>;
    },

    async updateStatus(id: string, status: string, resolvedAt?: string, snoozedUntil?: string) {
        const update: any = { status };
        if (resolvedAt) update.resolved_at = resolvedAt;
        if (snoozedUntil) update.snoozed_until = snoozedUntil;

        const { data, error } = await supabase
            .from('triggered_actions')
            .update(update)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Tables<'triggered_actions'>;
    },

    async dismiss(id: string) {
        return this.updateStatus(id, 'dismissed', new Date().toISOString());
    },

    async snooze(id: string, snoozeDurationHours: number) {
        const snoozeUntil = new Date(Date.now() + snoozeDurationHours * 60 * 60 * 1000).toISOString();
        return this.updateStatus(id, 'snoozed', undefined, snoozeUntil);
    },

    async resolve(id: string) {
        return this.updateStatus(id, 'resolved', new Date().toISOString());
    }
};
