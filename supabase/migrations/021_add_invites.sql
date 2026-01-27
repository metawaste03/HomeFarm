-- ============================================
-- MIGRATION: Add Invites Table
-- ============================================
-- This migration creates an invites table for storing pending team member invitations
-- Allows inviting users who don't have accounts yet
-- Create invites table
CREATE TABLE IF NOT EXISTS invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Manager', 'Worker')),
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'accepted', 'cancelled', 'expired')
    ),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_invites_farm_id ON invites(farm_id);
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_status ON invites(status);
CREATE INDEX IF NOT EXISTS idx_invites_email_status ON invites(email, status);
-- Enable RLS
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
-- RLS Policies
-- Farm owners and managers can see invites for their farms
CREATE POLICY "Farm members can view own farm invites" ON invites FOR
SELECT USING (
        farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
                AND role IN ('owner', 'manager')
        )
    );
-- Farm owners and managers can create invites
CREATE POLICY "Farm managers can create invites" ON invites FOR
INSERT WITH CHECK (
        farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
                AND role IN ('owner', 'manager')
        )
    );
-- Farm owners and managers can update invites (cancel, etc.)
CREATE POLICY "Farm managers can update invites" ON invites FOR
UPDATE USING (
        farm_id IN (
            SELECT farm_id
            FROM farm_members
            WHERE user_id = auth.uid()
                AND role IN ('owner', 'manager')
        )
    );
-- Users can view invites sent to their email (for processing on signup/login)
CREATE POLICY "Users can view own email invites" ON invites FOR
SELECT USING (
        email = (
            SELECT email
            FROM users
            WHERE id = auth.uid()
        )
    );
-- Users can update invites for their email (accept invite)
CREATE POLICY "Users can accept own invites" ON invites FOR
UPDATE USING (
        email = (
            SELECT email
            FROM users
            WHERE id = auth.uid()
        )
    );
-- Updated at trigger
CREATE OR REPLACE FUNCTION update_invites_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER invites_updated_at BEFORE
UPDATE ON invites FOR EACH ROW EXECUTE FUNCTION update_invites_updated_at();