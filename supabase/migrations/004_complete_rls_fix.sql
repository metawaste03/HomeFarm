-- ============================================
-- CRITICAL FIX: Complete RLS Data Isolation
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================
-- STEP 1: Disable RLS temporarily to clean up
ALTER TABLE farms DISABLE ROW LEVEL SECURITY;
ALTER TABLE batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE sales DISABLE ROW LEVEL SECURITY;
-- STEP 2: Drop ALL existing policies on farms
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'farms' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON farms',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 3: Drop ALL existing policies on batches
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'batches' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON batches',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 4: Drop ALL existing policies on other tables
DO $$
DECLARE pol RECORD;
BEGIN FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'daily_logs' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON daily_logs',
        pol.policyname
    );
END LOOP;
FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'tasks' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON tasks',
        pol.policyname
    );
END LOOP;
FOR pol IN
SELECT policyname
FROM pg_policies
WHERE tablename = 'sales' LOOP EXECUTE format(
        'DROP POLICY IF EXISTS %I ON sales',
        pol.policyname
    );
END LOOP;
END $$;
-- STEP 5: Re-enable RLS on all tables
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
-- STEP 6: Force RLS for table owners too (critical for data isolation)
ALTER TABLE farms FORCE ROW LEVEL SECURITY;
ALTER TABLE batches FORCE ROW LEVEL SECURITY;
ALTER TABLE daily_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
ALTER TABLE sales FORCE ROW LEVEL SECURITY;
-- STEP 7: Create simple, bulletproof policies for FARMS
-- Users can ONLY see farms where they are the owner
CREATE POLICY "farms_select_own" ON farms FOR
SELECT USING (owner_id = auth.uid());
CREATE POLICY "farms_insert_own" ON farms FOR
INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "farms_update_own" ON farms FOR
UPDATE USING (owner_id = auth.uid());
CREATE POLICY "farms_delete_own" ON farms FOR DELETE USING (owner_id = auth.uid());
-- STEP 8: Create policies for BATCHES
-- Users can only access batches that belong to their farms
CREATE POLICY "batches_all_own" ON batches FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 9: Create policies for DAILY_LOGS
CREATE POLICY "daily_logs_all_own" ON daily_logs FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 10: Create policies for TASKS
CREATE POLICY "tasks_all_own" ON tasks FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- STEP 11: Create policies for SALES
CREATE POLICY "sales_all_own" ON sales FOR ALL USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
);
-- ============================================
-- VERIFICATION: After running, check policies exist
-- ============================================
SELECT tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN (
        'farms',
        'batches',
        'daily_logs',
        'tasks',
        'sales'
    )
ORDER BY tablename,
    policyname;