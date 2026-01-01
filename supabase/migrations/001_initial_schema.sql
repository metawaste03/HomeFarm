-- HomeFarm Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE sector AS ENUM ('Layer', 'Broiler', 'Fish');
CREATE TYPE batch_status AS ENUM ('Active', 'Completed');
CREATE TYPE task_status AS ENUM ('pending', 'completed');
CREATE TYPE recurring_type AS ENUM ('No', 'Daily', 'Weekly', 'Monthly');
CREATE TYPE transaction_type AS ENUM ('purchase', 'usage');
CREATE TYPE inventory_category AS ENUM ('Feed', 'Medication', 'Equipment', 'Other');
CREATE TYPE farm_role AS ENUM ('owner', 'manager', 'worker');

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in TIMESTAMPTZ
);

-- Farms table
CREATE TABLE farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm members (many-to-many relationship)
CREATE TABLE farm_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role farm_role DEFAULT 'worker',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, user_id)
);

-- Batches table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    sector sector NOT NULL,
    status batch_status DEFAULT 'Active',
    stock_count INTEGER DEFAULT 0,
    age TEXT,
    schedule_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily logs table
CREATE TABLE daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    weather TEXT,
    activities JSONB,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to TEXT,
    due_date DATE,
    recurring recurring_type DEFAULT 'No',
    notes TEXT,
    status task_status DEFAULT 'pending',
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    item TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    sector sector NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category inventory_category NOT NULL,
    quantity DECIMAL(12, 2) DEFAULT 0,
    unit TEXT NOT NULL,
    min_threshold DECIMAL(12, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (for inventory)
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    type transaction_type NOT NULL,
    quantity DECIMAL(12, 2) NOT NULL,
    unit TEXT NOT NULL,
    cost DECIMAL(12, 2),
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    category TEXT NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health schedules table
CREATE TABLE health_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (for performance)
-- ============================================

CREATE INDEX idx_farms_owner ON farms(owner_id);
CREATE INDEX idx_farm_members_farm ON farm_members(farm_id);
CREATE INDEX idx_farm_members_user ON farm_members(user_id);
CREATE INDEX idx_batches_farm ON batches(farm_id);
CREATE INDEX idx_batches_sector ON batches(sector);
CREATE INDEX idx_daily_logs_farm ON daily_logs(farm_id);
CREATE INDEX idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX idx_tasks_farm ON tasks(farm_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_sales_farm ON sales(farm_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
CREATE INDEX idx_inventory_farm ON inventory_items(farm_id);
CREATE INDEX idx_transactions_item ON transactions(item_id);
CREATE INDEX idx_expenses_farm ON expenses(farm_id);
CREATE INDEX idx_suppliers_farm ON suppliers(farm_id);
CREATE INDEX idx_health_schedules_batch ON health_schedules(batch_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_schedules ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON users FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON users FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Helper function to check farm membership
CREATE OR REPLACE FUNCTION is_farm_member(farm_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM farm_members
        WHERE farm_id = farm_uuid AND user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM farms
        WHERE id = farm_uuid AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Farms policies
CREATE POLICY "Users can view farms they are members of"
    ON farms FOR SELECT
    USING (is_farm_member(id));

CREATE POLICY "Users can create farms"
    ON farms FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owners can update farms"
    ON farms FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Only owners can delete farms"
    ON farms FOR DELETE
    USING (auth.uid() = owner_id);

-- Farm members policies
CREATE POLICY "Members can view other members of their farms"
    ON farm_members FOR SELECT
    USING (is_farm_member(farm_id));

CREATE POLICY "Owners can add members to their farms"
    ON farm_members FOR INSERT
    WITH CHECK (
        EXISTS (SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid())
    );

CREATE POLICY "Owners can remove members from their farms"
    ON farm_members FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid())
    );

-- Generic policy for farm-scoped tables
-- Batches
CREATE POLICY "batches_select" ON batches FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "batches_insert" ON batches FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "batches_update" ON batches FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "batches_delete" ON batches FOR DELETE USING (is_farm_member(farm_id));

-- Daily logs
CREATE POLICY "daily_logs_select" ON daily_logs FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "daily_logs_insert" ON daily_logs FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "daily_logs_update" ON daily_logs FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "daily_logs_delete" ON daily_logs FOR DELETE USING (is_farm_member(farm_id));

-- Tasks
CREATE POLICY "tasks_select" ON tasks FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "tasks_insert" ON tasks FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "tasks_update" ON tasks FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "tasks_delete" ON tasks FOR DELETE USING (is_farm_member(farm_id));

-- Sales
CREATE POLICY "sales_select" ON sales FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "sales_insert" ON sales FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "sales_update" ON sales FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "sales_delete" ON sales FOR DELETE USING (is_farm_member(farm_id));

-- Inventory items
CREATE POLICY "inventory_items_select" ON inventory_items FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "inventory_items_insert" ON inventory_items FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "inventory_items_update" ON inventory_items FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "inventory_items_delete" ON inventory_items FOR DELETE USING (is_farm_member(farm_id));

-- Transactions (access through inventory item's farm)
CREATE POLICY "transactions_select" ON transactions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM inventory_items 
        WHERE inventory_items.id = transactions.item_id 
        AND is_farm_member(inventory_items.farm_id)
    ));
CREATE POLICY "transactions_insert" ON transactions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM inventory_items 
        WHERE inventory_items.id = transactions.item_id 
        AND is_farm_member(inventory_items.farm_id)
    ));
CREATE POLICY "transactions_update" ON transactions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM inventory_items 
        WHERE inventory_items.id = transactions.item_id 
        AND is_farm_member(inventory_items.farm_id)
    ));
CREATE POLICY "transactions_delete" ON transactions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM inventory_items 
        WHERE inventory_items.id = transactions.item_id 
        AND is_farm_member(inventory_items.farm_id)
    ));

-- Expenses
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (is_farm_member(farm_id));

-- Suppliers
CREATE POLICY "suppliers_select" ON suppliers FOR SELECT USING (is_farm_member(farm_id));
CREATE POLICY "suppliers_insert" ON suppliers FOR INSERT WITH CHECK (is_farm_member(farm_id));
CREATE POLICY "suppliers_update" ON suppliers FOR UPDATE USING (is_farm_member(farm_id));
CREATE POLICY "suppliers_delete" ON suppliers FOR DELETE USING (is_farm_member(farm_id));

-- Health schedules (access through batch's farm)
CREATE POLICY "health_schedules_select" ON health_schedules FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM batches 
        WHERE batches.id = health_schedules.batch_id 
        AND is_farm_member(batches.farm_id)
    ));
CREATE POLICY "health_schedules_insert" ON health_schedules FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM batches 
        WHERE batches.id = health_schedules.batch_id 
        AND is_farm_member(batches.farm_id)
    ));
CREATE POLICY "health_schedules_update" ON health_schedules FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM batches 
        WHERE batches.id = health_schedules.batch_id 
        AND is_farm_member(batches.farm_id)
    ));
CREATE POLICY "health_schedules_delete" ON health_schedules FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM batches 
        WHERE batches.id = health_schedules.batch_id 
        AND is_farm_member(batches.farm_id)
    ));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create user profile when auth user is created
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-add owner as farm member when farm is created
CREATE OR REPLACE FUNCTION handle_new_farm()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO farm_members (farm_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_farm_created
    AFTER INSERT ON farms
    FOR EACH ROW EXECUTE FUNCTION handle_new_farm();

-- Update user's last_sign_in
CREATE OR REPLACE FUNCTION handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET last_sign_in = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: This trigger needs auth.users access, may need adjustment
-- CREATE TRIGGER on_auth_user_sign_in
--     AFTER UPDATE ON auth.users
--     FOR EACH ROW
--     WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
--     EXECUTE FUNCTION handle_user_sign_in();
