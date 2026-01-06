-- ============================================
-- EMERGENCY FIX: Row Level Security Data Leak
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================

-- STEP 1: Check if RLS policies exist
-- This shows all policies on farms table
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'farms';

-- STEP 2: If no policies exist, the migration wasn't applied
-- Run these commands to fix:

-- Drop existing policies if any (clean slate)
DROP POLICY IF EXISTS "Users can view farms they are members of" ON farms;
DROP POLICY IF EXISTS "Users can create farms" ON farms;
DROP POLICY IF EXISTS "Only owners can update farms" ON farms;
DROP POLICY IF EXISTS "Only owners can delete farms" ON farms;

-- Ensure RLS is enabled
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create simple owner-based policies for farms
CREATE POLICY "Users can only view their own farms"
    ON farms FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own farms"
    ON farms FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own farms"
    ON farms FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own farms"
    ON farms FOR DELETE
    USING (auth.uid() = owner_id);

-- Create policies for batches (based on farm ownership)
DROP POLICY IF EXISTS "Users can access batches of their farms" ON batches;
CREATE POLICY "Users can access batches of their farms"
    ON batches FOR ALL
    USING (
        farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
    );

-- Create policies for daily_logs (based on farm ownership)
DROP POLICY IF EXISTS "Users can access logs of their farms" ON daily_logs;
CREATE POLICY "Users can access logs of their farms"
    ON daily_logs FOR ALL
    USING (
        farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
    );

-- Create policies for tasks (based on farm ownership)
DROP POLICY IF EXISTS "Users can access tasks of their farms" ON tasks;
CREATE POLICY "Users can access tasks of their farms"
    ON tasks FOR ALL
    USING (
        farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
    );

-- Create policies for sales (based on farm ownership)
DROP POLICY IF EXISTS "Users can access sales of their farms" ON sales;
CREATE POLICY "Users can access sales of their farms"
    ON sales FOR ALL
    USING (
        farm_id IN (SELECT id FROM farms WHERE owner_id = auth.uid())
    );

-- ============================================
-- STEP 3: CLEAR ALL TEST DATA (OPTIONAL - DESTRUCTIVE!)
-- Only run this if you want to delete ALL farm data
-- ============================================

-- WARNING: This deletes ALL farms and cascades to batches, logs, tasks, sales
-- TRUNCATE farms CASCADE;

-- ============================================
-- STEP 4: Verify the fix
-- After running, this should return empty if you're not an owner
-- ============================================

SELECT * FROM farms;
