-- ============================================
-- DELETE TEST TASK AND ITS TRIGGERED ACTIONS
-- Removes the test task "fod" and all related triggered actions
-- ============================================
-- Step 1: Check current tasks
SELECT id,
    title,
    due_date,
    status
FROM tasks
WHERE title = 'fod';
-- Step 2: Delete triggered actions related to task_overdue rule
-- (Since the task doesn't exist anymore, these are stale)
DELETE FROM triggered_actions
WHERE rule_id IN (
        SELECT id
        FROM action_rules
        WHERE rule_key = 'task_overdue'
    );
-- Step 3: Delete the test task (if it exists)
DELETE FROM tasks
WHERE title = 'fod';
-- Step 4: Verify everything is cleaned up
SELECT COUNT(*) as remaining_fod_tasks
FROM tasks
WHERE title = 'fod';
SELECT COUNT(*) as remaining_task_overdue_actions
FROM triggered_actions
WHERE rule_id IN (
        SELECT id
        FROM action_rules
        WHERE rule_key = 'task_overdue'
    );
-- Success message
DO $$ BEGIN RAISE NOTICE 'Test task and triggered actions deleted successfully!';
END $$;