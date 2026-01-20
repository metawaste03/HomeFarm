-- FIX: Resolve ambiguous column reference in user_has_farm_access function
-- The parameter 'farm_id' conflicted with the column 'farm_id' in farm_members table
-- Solution: Use table aliases to disambiguate column references
CREATE OR REPLACE FUNCTION user_has_farm_access(farm_id UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM farms f
        WHERE f.id = farm_id
            AND f.owner_id = auth.uid()
        UNION
        SELECT 1
        FROM farm_members fm
        WHERE fm.farm_id = user_has_farm_access.farm_id
            AND fm.user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE OR REPLACE FUNCTION is_farm_member(farm_uuid UUID) RETURNS BOOLEAN AS $$ BEGIN RETURN EXISTS (
        SELECT 1
        FROM farm_members fm
        WHERE fm.farm_id = farm_uuid
            AND fm.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1
        FROM farms f
        WHERE f.id = farm_uuid
            AND f.owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Notify completion
DO $$ BEGIN RAISE NOTICE 'Fixed ambiguous column reference in RLS functions!';
END $$;
-- Notify completion
DO $$ BEGIN RAISE NOTICE 'Fixed ambiguous column reference in RLS functions!';
END $$;