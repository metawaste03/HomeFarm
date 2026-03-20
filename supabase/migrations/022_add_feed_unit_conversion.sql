-- Migration: Add unit conversion support for feed inventory
-- This allows tracking feed in bags while storing internally in Kg for consistent consumption tracking

-- ============================================
-- ALTER TABLE: inventory_items
-- ============================================

-- Add weight_per_unit column: stores the weight in Kg for each unit (e.g., 25 for a 25Kg bag)
ALTER TABLE inventory_items 
ADD COLUMN weight_per_unit DECIMAL(12, 3) DEFAULT 1,
ADD COLUMN base_unit TEXT DEFAULT 'kg';

-- Add comment to explain the new columns
COMMENT ON COLUMN inventory_items.weight_per_unit IS 'Weight in Kg per unit (e.g., 25 for 25Kg bags, 1 for direct Kg). Used for unit conversion.';
COMMENT ON COLUMN inventory_items.base_unit IS 'Base unit for internal tracking (always kg for feed). Display unit is stored in unit column.';

-- Update existing records: set weight_per_unit to 1 (assumes existing items are already in base units)
UPDATE inventory_items 
SET weight_per_unit = 1, base_unit = 'kg'
WHERE weight_per_unit IS NULL;

-- Make columns NOT NULL after populating defaults
ALTER TABLE inventory_items 
ALTER COLUMN weight_per_unit SET NOT NULL,
ALTER COLUMN weight_per_unit SET DEFAULT 1,
ALTER COLUMN base_unit SET NOT NULL,
ALTER COLUMN base_unit SET DEFAULT 'kg';

-- ============================================
-- UPDATE RLS POLICIES
-- ============================================
-- No changes needed - existing policies cover the new columns
