-- ============================================
-- ADD OFFICIAL HEALTH SCHEDULE TEMPLATES
-- Universal templates for Layer & Broiler vaccination
-- ============================================
-- STEP 1: Modify health_schedules table to support universal templates
-- Make batch_id nullable to allow universal templates (not tied to specific batch)
ALTER TABLE health_schedules
ALTER COLUMN batch_id DROP NOT NULL;
-- Make scheduled_date nullable (universal templates use day_number instead)
ALTER TABLE health_schedules
ALTER COLUMN scheduled_date DROP NOT NULL;
-- Add new columns to support universal templates
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS is_universal BOOLEAN DEFAULT FALSE;
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS sector sector;
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS day_number INTEGER;
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS is_compulsory BOOLEAN DEFAULT FALSE;
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS dosage TEXT;
ALTER TABLE health_schedules
ADD COLUMN IF NOT EXISTS administration_method TEXT;
-- STEP 2: Update RLS policies to allow all users to VIEW universal templates
-- But only admins can create them (we'll insert them via migration)
-- Drop existing policy
DROP POLICY IF EXISTS "health_schedules_all_own" ON health_schedules;
-- Create new policies
-- Users can view their own batch schedules OR any universal template
CREATE POLICY "health_schedules_select" ON health_schedules FOR
SELECT USING (
        is_universal = true
        OR batch_id IN (
            SELECT id
            FROM batches
            WHERE farm_id IN (
                    SELECT id
                    FROM farms
                    WHERE owner_id = auth.uid()
                )
        )
    );
-- Users can only modify their own batch schedules (not universal templates)
CREATE POLICY "health_schedules_insert" ON health_schedules FOR
INSERT WITH CHECK (
        is_universal = false
        AND batch_id IN (
            SELECT id
            FROM batches
            WHERE farm_id IN (
                    SELECT id
                    FROM farms
                    WHERE owner_id = auth.uid()
                )
        )
    );
CREATE POLICY "health_schedules_update" ON health_schedules FOR
UPDATE USING (
        is_universal = false
        AND batch_id IN (
            SELECT id
            FROM batches
            WHERE farm_id IN (
                    SELECT id
                    FROM farms
                    WHERE owner_id = auth.uid()
                )
        )
    );
CREATE POLICY "health_schedules_delete" ON health_schedules FOR DELETE USING (
    is_universal = false
    AND batch_id IN (
        SELECT id
        FROM batches
        WHERE farm_id IN (
                SELECT id
                FROM farms
                WHERE owner_id = auth.uid()
            )
    )
);
-- STEP 3: Insert Official Layer/Broiler Health Schedule Template
-- This template is universally available to all users
INSERT INTO health_schedules (
        vaccine_name,
        day_number,
        is_universal,
        sector,
        is_compulsory,
        dosage,
        administration_method,
        notes
    )
VALUES (
        'Glucose or Vitamins',
        1,
        true,
        'Broiler',
        false,
        'As directed',
        'Drinking Water',
        NULL
    ),
    (
        'Antibiotics',
        2,
        true,
        'Broiler',
        false,
        'As directed',
        'Drinking Water',
        'Days 2-5'
    ),
    (
        'Anticocci and Vitamins',
        8,
        true,
        'Broiler',
        true,
        'As directed',
        'Drinking Water',
        'Days 8-12 (Compulsory)'
    ),
    (
        '1st Gumboro Vaccination (IBD)',
        10,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Drinking Water or Eye Drop',
        NULL
    ),
    (
        '1st Lasota Vaccination (Newcastle)',
        15,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        '2nd Gumboro Vaccination',
        20,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Drinking Water or Eye Drop',
        NULL
    ),
    (
        'Repeat Anticocci (Add CRD/Bacteria drugs)',
        24,
        true,
        'Broiler',
        true,
        'As directed',
        'Drinking Water',
        'Days 24-28, Add CRD/Bacteria drugs for 5 days (Compulsory)'
    ),
    (
        '2nd Lasota',
        30,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        'Pox Vaccination',
        35,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Wing Web Injection',
        'For Cockerel/Turkey/Pullets (Week 5)'
    ),
    (
        'Repeat Anticocci and Antibiotics',
        40,
        true,
        'Broiler',
        false,
        'As directed',
        'Drinking Water',
        'Add vitamin'
    ),
    (
        '3rd Lasota',
        45,
        true,
        'Broiler',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        'Deworm',
        50,
        true,
        'Broiler',
        false,
        'As directed',
        'Drinking Water',
        'Week 7 (day 50)'
    ),
    (
        'Repeat Anticocci/CRD Bacteria drugs + Vitamin',
        52,
        true,
        'Broiler',
        false,
        'As directed',
        'Drinking Water',
        NULL
    );
-- Also insert for Layer sector (same schedule)
INSERT INTO health_schedules (
        vaccine_name,
        day_number,
        is_universal,
        sector,
        is_compulsory,
        dosage,
        administration_method,
        notes
    )
VALUES (
        'Glucose or Vitamins',
        1,
        true,
        'Layer',
        false,
        'As directed',
        'Drinking Water',
        NULL
    ),
    (
        'Antibiotics',
        2,
        true,
        'Layer',
        false,
        'As directed',
        'Drinking Water',
        'Days 2-5'
    ),
    (
        'Anticocci and Vitamins',
        8,
        true,
        'Layer',
        true,
        'As directed',
        'Drinking Water',
        'Days 8-12 (Compulsory)'
    ),
    (
        '1st Gumboro Vaccination (IBD)',
        10,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Drinking Water or Eye Drop',
        NULL
    ),
    (
        '1st Lasota Vaccination (Newcastle)',
        15,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        '2nd Gumboro Vaccination',
        20,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Drinking Water or Eye Drop',
        NULL
    ),
    (
        'Repeat Anticocci (Add CRD/Bacteria drugs)',
        24,
        true,
        'Layer',
        true,
        'As directed',
        'Drinking Water',
        'Days 24-28, Add CRD/Bacteria drugs for 5 days (Compulsory)'
    ),
    (
        '2nd Lasota',
        30,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        'Pox Vaccination',
        35,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Wing Web Injection',
        'For Cockerel/Turkey/Pullets (Week 5)'
    ),
    (
        'Repeat Anticocci and Antibiotics',
        40,
        true,
        'Layer',
        false,
        'As directed',
        'Drinking Water',
        'Add vitamin'
    ),
    (
        '3rd Lasota',
        45,
        true,
        'Layer',
        false,
        '1 vial/1000 birds',
        'Drinking Water',
        NULL
    ),
    (
        'Deworm',
        50,
        true,
        'Layer',
        false,
        'As directed',
        'Drinking Water',
        'Week 7 (day 50)'
    ),
    (
        'Repeat Anticocci/CRD Bacteria drugs + Vitamin',
        52,
        true,
        'Layer',
        false,
        'As directed',
        'Drinking Water',
        NULL
    );
-- STEP 4: Verification query
SELECT vaccine_name,
    day_number,
    sector,
    is_compulsory,
    is_universal
FROM health_schedules
WHERE is_universal = true
ORDER BY sector,
    day_number;
-- Success message
DO $$ BEGIN RAISE NOTICE 'Official health schedule templates added successfully!';
END $$;