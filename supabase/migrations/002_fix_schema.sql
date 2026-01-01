-- HomeFarm Database Schema - SAFE FIX VERSION
-- This script can be run multiple times safely
-- Run this in Supabase SQL Editor to fix any incomplete migration

-- ============================================
-- ENUM TYPES (conditional creation)
-- ============================================

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sector') THEN
    CREATE TYPE sector AS ENUM ('Layer', 'Broiler', 'Fish');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'batch_status') THEN
    CREATE TYPE batch_status AS ENUM ('Active', 'Completed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'task_status') THEN
    CREATE TYPE task_status AS ENUM ('pending', 'completed');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurring_type') THEN
    CREATE TYPE recurring_type AS ENUM ('No', 'Daily', 'Weekly', 'Monthly');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'transaction_type') THEN
    CREATE TYPE transaction_type AS ENUM ('purchase', 'usage');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'inventory_category') THEN
    CREATE TYPE inventory_category AS ENUM ('Feed', 'Medication', 'Equipment', 'Other');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'farm_role') THEN
    CREATE TYPE farm_role AS ENUM ('owner', 'manager', 'worker');
  END IF;
END $$;

-- ============================================
-- TABLES (IF NOT EXISTS)
-- ============================================

-- Users table (synced with Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_sign_in TIMESTAMPTZ
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm members (for multi-user support)
CREATE TABLE IF NOT EXISTS farm_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role farm_role DEFAULT 'worker',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(farm_id, user_id)
);

-- Batches table
CREATE TABLE IF NOT EXISTS batches (
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
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    log_date DATE NOT NULL,
    weather TEXT,
    activities JSONB,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    assigned_to UUID REFERENCES auth.users(id),
    due_date DATE,
    recurring recurring_type DEFAULT 'No',
    notes TEXT,
    status task_status DEFAULT 'pending',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    sale_date DATE NOT NULL,
    item TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    sector sector NOT NULL,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items table
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category inventory_category NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 0,
    unit TEXT NOT NULL,
    min_threshold DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table (for inventory)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    type transaction_type NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit TEXT NOT NULL,
    cost DECIMAL(12,2),
    supplier TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    category TEXT NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health schedules table
CREATE TABLE IF NOT EXISTS health_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    vaccine_name TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES (IF NOT EXISTS)
-- ============================================

CREATE INDEX IF NOT EXISTS idx_farms_owner ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_farm ON farm_members(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_user ON farm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_farm ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_farm ON daily_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_batch ON daily_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_daily_logs_date ON daily_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_tasks_farm ON tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_sales_farm ON sales(farm_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_inventory_farm ON inventory_items(farm_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item ON transactions(item_id);
CREATE INDEX IF NOT EXISTS idx_expenses_farm ON expenses(farm_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_farm ON suppliers(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_schedules_batch ON health_schedules(batch_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

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

-- ============================================
-- RLS POLICIES (DROP first, then CREATE)
-- ============================================

-- Helper function to check farm access
CREATE OR REPLACE FUNCTION user_has_farm_access(farm_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid()
    UNION
    SELECT 1 FROM farm_members WHERE farm_id = user_has_farm_access.farm_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

-- Farms policies
DROP POLICY IF EXISTS "Users can view their farms" ON farms;
DROP POLICY IF EXISTS "Users can create farms" ON farms;
DROP POLICY IF EXISTS "Owners can update their farms" ON farms;
DROP POLICY IF EXISTS "Owners can delete their farms" ON farms;
CREATE POLICY "Users can view their farms" ON farms FOR SELECT USING (user_has_farm_access(id));
CREATE POLICY "Users can create farms" ON farms FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners can update their farms" ON farms FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Owners can delete their farms" ON farms FOR DELETE USING (auth.uid() = owner_id);

-- Farm members policies
DROP POLICY IF EXISTS "Users can view farm members" ON farm_members;
DROP POLICY IF EXISTS "Owners can manage farm members" ON farm_members;
CREATE POLICY "Users can view farm members" ON farm_members FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Owners can manage farm members" ON farm_members FOR ALL USING (
  EXISTS (SELECT 1 FROM farms WHERE id = farm_id AND owner_id = auth.uid())
);

-- Batches policies
DROP POLICY IF EXISTS "Users can view batches" ON batches;
DROP POLICY IF EXISTS "Users can manage batches" ON batches;
CREATE POLICY "Users can view batches" ON batches FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage batches" ON batches FOR ALL USING (user_has_farm_access(farm_id));

-- Daily logs policies
DROP POLICY IF EXISTS "Users can view logs" ON daily_logs;
DROP POLICY IF EXISTS "Users can manage logs" ON daily_logs;
CREATE POLICY "Users can view logs" ON daily_logs FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage logs" ON daily_logs FOR ALL USING (user_has_farm_access(farm_id));

-- Tasks policies
DROP POLICY IF EXISTS "Users can view tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage tasks" ON tasks;
CREATE POLICY "Users can view tasks" ON tasks FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage tasks" ON tasks FOR ALL USING (user_has_farm_access(farm_id));

-- Sales policies
DROP POLICY IF EXISTS "Users can view sales" ON sales;
DROP POLICY IF EXISTS "Users can manage sales" ON sales;
CREATE POLICY "Users can view sales" ON sales FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage sales" ON sales FOR ALL USING (user_has_farm_access(farm_id));

-- Inventory policies
DROP POLICY IF EXISTS "Users can view inventory" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage inventory" ON inventory_items;
CREATE POLICY "Users can view inventory" ON inventory_items FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage inventory" ON inventory_items FOR ALL USING (user_has_farm_access(farm_id));

-- Transactions policies
DROP POLICY IF EXISTS "Users can view transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage transactions" ON transactions;
CREATE POLICY "Users can view transactions" ON transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND user_has_farm_access(farm_id))
);
CREATE POLICY "Users can manage transactions" ON transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM inventory_items WHERE id = item_id AND user_has_farm_access(farm_id))
);

-- Expenses policies
DROP POLICY IF EXISTS "Users can view expenses" ON expenses;
DROP POLICY IF EXISTS "Users can manage expenses" ON expenses;
CREATE POLICY "Users can view expenses" ON expenses FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage expenses" ON expenses FOR ALL USING (user_has_farm_access(farm_id));

-- Suppliers policies
DROP POLICY IF EXISTS "Users can view suppliers" ON suppliers;
DROP POLICY IF EXISTS "Users can manage suppliers" ON suppliers;
CREATE POLICY "Users can view suppliers" ON suppliers FOR SELECT USING (user_has_farm_access(farm_id));
CREATE POLICY "Users can manage suppliers" ON suppliers FOR ALL USING (user_has_farm_access(farm_id));

-- Health schedules policies
DROP POLICY IF EXISTS "Users can view health schedules" ON health_schedules;
DROP POLICY IF EXISTS "Users can manage health schedules" ON health_schedules;
CREATE POLICY "Users can view health schedules" ON health_schedules FOR SELECT USING (
  EXISTS (SELECT 1 FROM batches WHERE id = batch_id AND user_has_farm_access(farm_id))
);
CREATE POLICY "Users can manage health schedules" ON health_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM batches WHERE id = batch_id AND user_has_farm_access(farm_id))
);

-- ============================================
-- TRIGGER: Auto-create user profile on signup
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, users.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Success message
DO $$ BEGIN RAISE NOTICE 'HomeFarm database schema created/updated successfully!'; END $$;
