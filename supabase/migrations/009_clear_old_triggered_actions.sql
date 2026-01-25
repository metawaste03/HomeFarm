-- ============================================
-- AGGRESSIVE CLEANUP - Remove ALL triggered actions
-- This will force the system to regenerate fresh actions
-- ============================================
-- Check current count
SELECT COUNT(*) as current_count
FROM triggered_actions;
-- Delete ALL triggered actions (most aggressive)
TRUNCATE TABLE triggered_actions CASCADE;
-- Alternative: Delete with explicit WHERE to avoid any constraints
-- DELETE FROM triggered_actions WHERE true;
-- Verify deletion
SELECT COUNT(*) as remaining_count
FROM triggered_actions;
-- Show remaining records (should be empty)
SELECT *
FROM triggered_actions;
-- Success message
DO $$ BEGIN RAISE NOTICE 'All triggered actions have been completely cleared!';
END $$;