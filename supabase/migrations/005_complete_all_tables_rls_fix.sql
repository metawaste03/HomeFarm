-- ============================================
-- COMPLETE RLS FIX FOR ALL REMAINING TABLES
-- Run this in Supabase SQL Editor after 004_complete_rls_fix.sql
-- ============================================
-- STEP 1: Disable RLS temporarily on remaining tables
ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE health_schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members DISABLE ROW LEVEL SECURITY;
-- STEP 2: Drop ALL existing policies on inventory_items
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'inventory_items' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON inventory_items',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 3: Drop ALL existing policies on transactions
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'transactions' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON transactions',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 4: Drop ALL existing policies on expenses
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'expenses' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON expenses',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 5: Drop ALL existing policies on suppliers
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'suppliers' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON suppliers',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 6: Drop ALL existing policies on health_schedules
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'health_schedules' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON health_schedules',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 7: Drop ALL existing policies on users
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'users' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON users',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 8: Drop ALL existing policies on farm_members
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'farm_members' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON farm_members',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 9: Re-enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
-- STEP 10: Force RLS for table owners too
ALTER TABLE inventory_items FORCE ROW LEVEL SECURITY;
ALTER TABLE transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
ALTER TABLE suppliers FORCE ROW LEVEL SECURITY;
ALTER TABLE health_schedules FORCE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
ALTER TABLE farm_members FORCE ROW LEVEL SECURITY;
-- STEP 11: Create policies for INVENTORY_ITEMS
CREATE POLICY "inventory_items_all_own" ON inventory_items FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 12: Create policies for TRANSACTIONS
-- Transactions are linked to inventory_items, which are farm-specific
CREATE POLICY "transactions_all_own" ON transactions FOR ALL USING (
    item_id IN (
        SELECT id
        FROM inventory_items
        WHERE farm_id IN (
                SELECT id
                FROM farms
                WHERE owner_id = auth.uid()
            )
    )
);
-- STEP 13: Create policies for EXPENSES
CREATE POLICY "expenses_all_own" ON expenses FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 14: Create policies for SUPPLIERS
CREATE POLICY "suppliers_all_own" ON suppliers FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 15: Create policies for HEALTH_SCHEDULES
-- Health schedules are linked to batches, which are farm-specific
CREATE POLICY "health_schedules_all_own" ON health_schedules FOR ALL USING (
    batch_id IN (
        SELECT id
        FROM batches
        WHERE farm_id IN (
                SELECT id
                FROM farms
                WHERE owner_id = auth.uid()
            )
    )
);
-- STEP 16: Create policies for USERS
CREATE POLICY "users_select_own" ON users FOR
SELECT USING (id = auth.uid());
CREATE POLICY "users_update_own" ON users FOR
UPDATE USING (id = auth.uid());
-- STEP 17: Create policies for FARM_MEMBERS
CREATE POLICY "farm_members_select_own" ON farm_members FOR
SELECT USING (
        user_id = auth.uid()
        OR farm_id IN (
            SELECT id
            FROM farms
            WHERE owner_id = auth.uid()
        )
    );
CREATE POLICY "farm_members_manage_own" ON farm_members FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- ============================================
-- VERIFICATION: Check all policies exist
-- ============================================
SELECT tablename,
    policyname,
    cmd
FROM pg_policies
WHERE tablename IN (
        'inventory_items',
        'transactions',
        'expenses',
        'suppliers',
        'health_schedules',
        'users',
        'farm_members'
    )
ORDER BY tablename,
    policyname;