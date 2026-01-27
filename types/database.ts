// TypeScript types for the Supabase database schema
// These types provide type safety when querying the database

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[];

export type Sector = 'Layer' | 'Broiler' | 'Fish';
export type BatchStatus = 'Active' | 'Completed';
export type TaskStatus = 'pending' | 'completed';
export type RecurringType = 'No' | 'Daily' | 'Weekly' | 'Monthly';
export type TransactionType = 'purchase' | 'usage';
export type InventoryCategory = 'Feed' | 'Medication' | 'Equipment' | 'Product' | 'Other';
export type FarmRole = 'owner' | 'manager' | 'worker';

// Action Rules types
export type ActionSeverity = 'critical' | 'warning' | 'info';
export type ActionStatus = 'active' | 'dismissed' | 'snoozed' | 'resolved';
export type ConditionType =
    | 'inventory_below_threshold'
    | 'days_since_last_log'
    | 'mortality_rate'
    | 'health_schedule_due'
    | 'age_in_weeks'
    | 'egg_production_drop'
    | 'weight_below_expected'
    | 'task_overdue'
    | 'batch_missing_start_date';

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    avatar_url: string | null;
                    created_at: string;
                    last_sign_in: string | null;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    last_sign_in?: string | null;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    avatar_url?: string | null;
                    created_at?: string;
                    last_sign_in?: string | null;
                };
            };
            farms: {
                Row: {
                    id: string;
                    name: string;
                    location: string | null;
                    owner_id: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    location?: string | null;
                    owner_id: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    location?: string | null;
                    owner_id?: string;
                    created_at?: string;
                };
            };
            farm_members: {
                Row: {
                    id: string;
                    farm_id: string;
                    user_id: string;
                    role: FarmRole;
                    joined_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    user_id: string;
                    role?: FarmRole;
                    joined_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    user_id?: string;
                    role?: FarmRole;
                    joined_at?: string;
                };
            };
            batches: {
                Row: {
                    id: string;
                    farm_id: string;
                    name: string;
                    sector: Sector;
                    status: BatchStatus;
                    stock_count: number;
                    age: string | null;
                    start_date: string | null;
                    schedule_id: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    name: string;
                    sector: Sector;
                    status?: BatchStatus;
                    stock_count?: number;
                    age?: string | null;
                    start_date?: string | null;
                    schedule_id?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    name?: string;
                    sector?: Sector;
                    status?: BatchStatus;
                    stock_count?: number;
                    age?: string | null;
                    start_date?: string | null;
                    schedule_id?: string | null;
                    created_at?: string;
                };
            };
            daily_logs: {
                Row: {
                    id: string;
                    farm_id: string;
                    batch_id: string | null;
                    log_date: string;
                    weather: string | null;
                    activities: Json | null;
                    notes: string | null;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    batch_id?: string | null;
                    log_date: string;
                    weather?: string | null;
                    activities?: Json | null;
                    notes?: string | null;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    batch_id?: string | null;
                    log_date?: string;
                    weather?: string | null;
                    activities?: Json | null;
                    notes?: string | null;
                    created_by?: string;
                    created_at?: string;
                };
            };
            tasks: {
                Row: {
                    id: string;
                    farm_id: string;
                    title: string;
                    assigned_to: string | null;
                    due_date: string | null;
                    recurring: RecurringType;
                    notes: string | null;
                    status: TaskStatus;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    title: string;
                    assigned_to?: string | null;
                    due_date?: string | null;
                    recurring?: RecurringType;
                    notes?: string | null;
                    status?: TaskStatus;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    title?: string;
                    assigned_to?: string | null;
                    due_date?: string | null;
                    recurring?: RecurringType;
                    notes?: string | null;
                    status?: TaskStatus;
                    created_by?: string;
                    created_at?: string;
                };
            };
            sales: {
                Row: {
                    id: string;
                    farm_id: string;
                    sale_date: string;
                    item: string;
                    quantity: number;
                    unit: string;
                    amount: number;
                    sector: Sector;
                    notes: string | null;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    sale_date: string;
                    item: string;
                    quantity: number;
                    unit: string;
                    amount: number;
                    sector: Sector;
                    notes?: string | null;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    sale_date?: string;
                    item?: string;
                    quantity?: number;
                    unit?: string;
                    amount?: number;
                    sector?: Sector;
                    notes?: string | null;
                    created_by?: string;
                    created_at?: string;
                };
            };
            inventory_items: {
                Row: {
                    id: string;
                    farm_id: string;
                    name: string;
                    category: InventoryCategory;
                    quantity: number;
                    unit: string;
                    min_threshold: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    name: string;
                    category: InventoryCategory;
                    quantity?: number;
                    unit: string;
                    min_threshold?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    name?: string;
                    category?: InventoryCategory;
                    quantity?: number;
                    unit?: string;
                    min_threshold?: number;
                    created_at?: string;
                };
            };
            transactions: {
                Row: {
                    id: string;
                    item_id: string;
                    transaction_date: string;
                    type: TransactionType;
                    quantity: number;
                    unit: string;
                    cost: number | null;
                    supplier: string | null;
                    notes: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    item_id: string;
                    transaction_date: string;
                    type: TransactionType;
                    quantity: number;
                    unit: string;
                    cost?: number | null;
                    supplier?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    item_id?: string;
                    transaction_date?: string;
                    type?: TransactionType;
                    quantity?: number;
                    unit?: string;
                    cost?: number | null;
                    supplier?: string | null;
                    notes?: string | null;
                    created_at?: string;
                };
            };
            expenses: {
                Row: {
                    id: string;
                    farm_id: string;
                    amount: number;
                    category: string;
                    expense_date: string;
                    description: string | null;
                    created_by: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    amount: number;
                    category: string;
                    expense_date: string;
                    description?: string | null;
                    created_by: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    amount?: number;
                    category?: string;
                    expense_date?: string;
                    description?: string | null;
                    created_by?: string;
                    created_at?: string;
                };
            };
            suppliers: {
                Row: {
                    id: string;
                    farm_id: string;
                    name: string;
                    contact: string | null;
                    category: string | null;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    name: string;
                    contact?: string | null;
                    category?: string | null;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    name?: string;
                    contact?: string | null;
                    category?: string | null;
                    created_at?: string;
                };
            };
            health_schedules: {
                Row: {
                    id: string;
                    batch_id: string | null;
                    vaccine_name: string;
                    scheduled_date: string | null;
                    completed: boolean;
                    notes: string | null;
                    created_at: string;
                    // Columns for universal templates
                    is_universal: boolean;
                    sector: Sector | null;
                    day_number: number | null;
                    is_compulsory: boolean;
                    dosage: string | null;
                    administration_method: string | null;
                    // Columns for user templates
                    created_by: string | null;
                    template_name: string | null;
                    is_user_template: boolean;
                    completed_date: string | null;
                };
                Insert: {
                    id?: string;
                    batch_id?: string | null;
                    vaccine_name: string;
                    scheduled_date?: string | null;
                    completed?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    is_universal?: boolean;
                    sector?: Sector | null;
                    day_number?: number | null;
                    is_compulsory?: boolean;
                    dosage?: string | null;
                    administration_method?: string | null;
                    created_by?: string | null;
                    template_name?: string | null;
                    is_user_template?: boolean;
                    completed_date?: string | null;
                };
                Update: {
                    id?: string;
                    batch_id?: string | null;
                    vaccine_name?: string;
                    scheduled_date?: string | null;
                    completed?: boolean;
                    notes?: string | null;
                    created_at?: string;
                    is_universal?: boolean;
                    sector?: Sector | null;
                    day_number?: number | null;
                    is_compulsory?: boolean;
                    dosage?: string | null;
                    administration_method?: string | null;
                    created_by?: string | null;
                    template_name?: string | null;
                    is_user_template?: boolean;
                    completed_date?: string | null;
                };
            };
            tips: {
                Row: {
                    id: string;
                    user_id: string | null;
                    sector: Sector;
                    type: 'Do' | 'Don\'t';
                    content: string;
                    votes: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    user_id?: string | null;
                    sector: Sector;
                    type: 'Do' | 'Don\'t';
                    content: string;
                    votes?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    user_id?: string | null;
                    sector?: Sector;
                    type?: 'Do' | 'Don\'t';
                    content?: string;
                    votes?: number;
                    created_at?: string;
                };
            };
            tip_votes: {
                Row: {
                    id: string;
                    tip_id: string;
                    user_id: string;
                    vote_type: number;
                };
                Insert: {
                    id?: string;
                    tip_id: string;
                    user_id: string;
                    vote_type: number;
                };
                Update: {
                    id?: string;
                    tip_id?: string;
                    user_id?: string;
                    vote_type?: number;
                };
            };
            // Today's Actions - Rule Engine tables
            action_rules: {
                Row: {
                    id: string;
                    rule_key: string;
                    title: string;
                    description: string;
                    action_text: string;
                    sector: Sector | null;
                    severity: ActionSeverity;
                    condition_type: ConditionType;
                    condition_params: Json;
                    is_active: boolean;
                    votes_up: number;
                    votes_down: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    rule_key: string;
                    title: string;
                    description: string;
                    action_text: string;
                    sector?: Sector | null;
                    severity?: ActionSeverity;
                    condition_type: ConditionType;
                    condition_params: Json;
                    is_active?: boolean;
                    votes_up?: number;
                    votes_down?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    rule_key?: string;
                    title?: string;
                    description?: string;
                    action_text?: string;
                    sector?: Sector | null;
                    severity?: ActionSeverity;
                    condition_type?: ConditionType;
                    condition_params?: Json;
                    is_active?: boolean;
                    votes_up?: number;
                    votes_down?: number;
                    created_at?: string;
                };
            };
            rule_votes: {
                Row: {
                    id: string;
                    rule_id: string;
                    user_id: string;
                    vote_type: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    rule_id: string;
                    user_id: string;
                    vote_type: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    rule_id?: string;
                    user_id?: string;
                    vote_type?: number;
                    created_at?: string;
                };
            };
            triggered_actions: {
                Row: {
                    id: string;
                    farm_id: string;
                    rule_id: string;
                    batch_id: string | null;
                    triggered_at: string;
                    status: ActionStatus;
                    snoozed_until: string | null;
                    resolved_at: string | null;
                    metadata: Json;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    rule_id: string;
                    batch_id?: string | null;
                    triggered_at?: string;
                    status?: ActionStatus;
                    snoozed_until?: string | null;
                    resolved_at?: string | null;
                    metadata?: Json;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    rule_id?: string;
                    batch_id?: string | null;
                    triggered_at?: string;
                    status?: ActionStatus;
                    snoozed_until?: string | null;
                    resolved_at?: string | null;
                    metadata?: Json;
                };
            };
            invites: {
                Row: {
                    id: string;
                    farm_id: string;
                    email: string;
                    role: 'Manager' | 'Worker';
                    invited_by: string;
                    invited_at: string;
                    status: 'pending' | 'accepted' | 'cancelled' | 'expired';
                    accepted_at: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    farm_id: string;
                    email: string;
                    role: 'Manager' | 'Worker';
                    invited_by: string;
                    invited_at?: string;
                    status?: 'pending' | 'accepted' | 'cancelled' | 'expired';
                    accepted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    farm_id?: string;
                    email?: string;
                    role?: 'Manager' | 'Worker';
                    invited_by?: string;
                    invited_at?: string;
                    status?: 'pending' | 'accepted' | 'cancelled' | 'expired';
                    accepted_at?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
            };
        };
        Views: {};
        Functions: {};
        Enums: {
            sector: Sector;
            batch_status: BatchStatus;
            task_status: TaskStatus;
            recurring_type: RecurringType;
            transaction_type: TransactionType;
            inventory_category: InventoryCategory;
            farm_role: FarmRole;
            action_severity: ActionSeverity;
            action_status: ActionStatus;
            condition_type: ConditionType;
        };
    };
}

// Convenience type aliases for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
