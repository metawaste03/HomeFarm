-- Migration: Fix cascade delete for triggered_actions table
-- When a batch is deleted, also delete any triggered actions associated with it
-- Previously: ON DELETE SET NULL (left orphaned records)
-- Fixed: ON DELETE CASCADE (removes associated actions)
-- Step 1: First, clean up any existing orphaned triggered_actions (where batch_id is NULL)
DELETE FROM triggered_actions
WHERE batch_id IS NULL;
-- Step 2: Drop the existing foreign key constraint
ALTER TABLE triggered_actions DROP CONSTRAINT IF EXISTS triggered_actions_batch_id_fkey;
-- Step 3: Re-add the constraint with ON DELETE CASCADE
ALTER TABLE triggered_actions
ADD CONSTRAINT triggered_actions_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE;
-- Note: This means when a batch is deleted, all triggered_actions 
-- referencing that batch will also be automatically deleted.