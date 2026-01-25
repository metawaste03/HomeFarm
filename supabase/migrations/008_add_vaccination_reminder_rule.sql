-- ============================================
-- ADD VACCINATION REMINDER ACTION RULE
-- Creates Today's Action rule for due/overdue vaccinations
-- ============================================
-- Insert vaccination reminder rule into action_rules table
INSERT INTO action_rules (
        rule_key,
        title,
        description,
        action_text,
        sector,
        severity,
        condition_type,
        condition_params,
        is_active,
        votes_up,
        votes_down
    )
VALUES (
        'vaccination_due',
        'Vaccination Due',
        'A scheduled vaccination is due or overdue for one of your batches',
        'Administer vaccination to batch',
        NULL,
        -- applies to all sectors
        'warning',
        'health_schedule_due',
        '{"days_tolerance": 0}'::json,
        true,
        0,
        0
    );
-- Verification
SELECT rule_key,
    title,
    condition_type,
    severity,
    is_active
FROM action_rules
WHERE rule_key = 'vaccination_due';
-- Success message
DO $$ BEGIN RAISE NOTICE 'Vaccination reminder rule added successfully!';
END $$;