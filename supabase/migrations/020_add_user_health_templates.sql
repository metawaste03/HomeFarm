-- Migration: Add support for user-created health templates
-- This adds columns to support user-created templates and custom batch tasks
-- Add created_by column to track who created the template/task
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
-- Add template_name for user templates (null for batch-specific tasks)
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS template_name TEXT;
-- Add is_user_template to distinguish from official templates
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS is_user_template BOOLEAN DEFAULT false;
-- Add completed_date to track when a task was marked complete
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS completed_date DATE;
-- Create index for faster user template queries
CREATE INDEX IF NOT EXISTS idx_health_schedules_user_template ON health_schedules(created_by, is_user_template)
WHERE is_user_template = true;
-- Create index for batch schedule queries
CREATE INDEX IF NOT EXISTS idx_health_schedules_batch ON health_schedules(batch_id, scheduled_date)
WHERE batch_id IS NOT NULL;
-- RLS policy for user templates
-- Users can read their own templates
CREATE POLICY "Users can read own templates" ON health_schedules FOR
SELECT USING (
        is_universal = true
        OR created_by = auth.uid()
        OR batch_id IN (
            SELECT b.id
            FROM batches b
                JOIN farms f ON b.farm_id = f.id
            WHERE f.owner_id = auth.uid()
        )
    );
-- Users can insert their own templates and batch tasks
CREATE POLICY "Users can insert own templates" ON health_schedules FOR
INSERT WITH CHECK (
        created_by = auth.uid()
        OR batch_id IN (
            SELECT b.id
            FROM batches b
                JOIN farms f ON b.farm_id = f.id
            WHERE f.owner_id = auth.uid()
        )
    );
-- Users can update their own templates and batch tasks
CREATE POLICY "Users can update own templates" ON health_schedules FOR
UPDATE USING (
        created_by = auth.uid()
        OR batch_id IN (
            SELECT b.id
            FROM batches b
                JOIN farms f ON b.farm_id = f.id
            WHERE f.owner_id = auth.uid()
        )
    );
-- Users can delete their own templates (not universal ones)
CREATE POLICY "Users can delete own templates" ON health_schedules FOR DELETE USING (
    is_universal = false
    AND (
        created_by = auth.uid()
        OR batch_id IN (
            SELECT b.id
            FROM batches b
                JOIN farms f ON b.farm_id = f.id
            WHERE f.owner_id = auth.uid()
        )
    )
);