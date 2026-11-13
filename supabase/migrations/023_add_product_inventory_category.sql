-- The app stores collected eggs in inventory under the 'Product' category
-- (DailyLogScreen -> recordProduction, SalesScreen), but the enum was created
-- without it, so saving a log with eggs failed.
ALTER TYPE inventory_category ADD VALUE IF NOT EXISTS 'Product';
