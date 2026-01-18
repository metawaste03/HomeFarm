-- Migration: Add Today's Actions Rule Engine tables
-- This migration adds the action rules system for generating actionable recommendations
-- Add start_date column to batches (nullable for backwards compatibility)
ALTER TABLE batches
ADD COLUMN IF NOT EXISTS start_date DATE;
-- Create action_rules table
CREATE TABLE IF NOT EXISTS action_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    action_text TEXT NOT NULL,
    sector VARCHAR(20),
    severity VARCHAR(20) DEFAULT 'warning',
    condition_type VARCHAR(50) NOT NULL,
    condition_params JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    votes_up INTEGER DEFAULT 0,
    votes_down INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create rule_votes table (for future expert voting)
CREATE TABLE IF NOT EXISTS rule_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID REFERENCES action_rules(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    vote_type INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(rule_id, user_id)
);
-- Create triggered_actions table
CREATE TABLE IF NOT EXISTS triggered_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES action_rules(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE
    SET NULL,
        triggered_at TIMESTAMPTZ DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'active',
        snoozed_until TIMESTAMPTZ,
        resolved_at TIMESTAMPTZ,
        metadata JSONB DEFAULT '{}'
);
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_action_rules_active ON action_rules(is_active)
WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_action_rules_sector ON action_rules(sector);
CREATE INDEX IF NOT EXISTS idx_triggered_actions_farm ON triggered_actions(farm_id);
CREATE INDEX IF NOT EXISTS idx_triggered_actions_status ON triggered_actions(status);
CREATE INDEX IF NOT EXISTS idx_triggered_actions_farm_status ON triggered_actions(farm_id, status);
-- Enable RLS for new tables
ALTER TABLE action_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggered_actions ENABLE ROW LEVEL SECURITY;
-- RLS Policies for action_rules (read-only for all authenticated users)
CREATE POLICY "Anyone can read active rules" ON action_rules FOR
SELECT TO authenticated USING (is_active = true);
-- RLS Policies for rule_votes
CREATE POLICY "Users can manage own votes" ON rule_votes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- RLS Policies for triggered_actions
CREATE POLICY "Users can read triggered actions for their farms" ON triggered_actions FOR
SELECT TO authenticated USING (
        farm_id IN (
            SELECT id
            FROM farms
            WHERE owner_id = auth.uid()
        )
        OR farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Users can insert triggered actions for their farms" ON triggered_actions FOR
INSERT TO authenticated WITH CHECK (
        farm_id IN (
            SELECT id
            FROM farms
            WHERE owner_id = auth.uid()
        )
        OR farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update triggered actions for their farms" ON triggered_actions FOR
UPDATE TO authenticated USING (
        farm_id IN (
            SELECT id
            FROM farms
            WHERE owner_id = auth.uid()
        )
        OR farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
        )
    ) WITH CHECK (
        farm_id IN (
            SELECT id
            FROM farms
            WHERE owner_id = auth.uid()
        )
        OR farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete triggered actions for their farms" ON triggered_actions FOR DELETE TO authenticated USING (
    farm_id IN (
        SELECT id
        FROM farms
        WHERE owner_id = auth.uid()
    )
    OR farm_id IN (
        SELECT farm_id
        FROM farm_members
        WHERE user_id = auth.uid()
    )
);