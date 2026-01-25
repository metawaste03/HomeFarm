-- ============================================
-- CLEANUP ORPHANED LOGS AND FIX CASCADE DELETION
-- This fixes the issue where logs remain after farms/batches are deleted
-- ============================================
-- STEP 1: Delete all orphaned daily_logs (logs with NULL batch_id or deleted farm_id)
-- These are logs that belong to deleted batches or farms
DELETE FROM daily_logs
WHERE batch_id IS NULL
    OR farm_id NOT IN (
        SELECT id
        FROM farms
    );
-- STEP 2: Fix the foreign key constraint for batch_id
-- Change from ON DELETE SET NULL to ON DELETE CASCADE
-- This ensures when a batch is deleted, its logs are also deleted
-- First, drop the existing constraint
ALTER TABLE daily_logs DROP CONSTRAINT IF EXISTS daily_logs_batch_id_fkey;
-- Recreate it with CASCADE
ALTER TABLE daily_logs
ADD CONSTRAINT daily_logs_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE;
-- STEP 3: Verify the cleanup
-- This should only show logs for existing farms
SELECT dl.id,
    dl.log_date,
    f.name as farm_name,
    b.name as batch_name
FROM daily_logs dl
    LEFT JOIN farms f ON dl.farm_id = f.id
    LEFT JOIN batches b ON dl.batch_id = b.id
ORDER BY dl.log_date DESC
LIMIT 10;
-- Success message
DO $$ BEGIN RAISE NOTICE 'Orphaned logs cleaned up and cascade deletion fixed!';
END $$;