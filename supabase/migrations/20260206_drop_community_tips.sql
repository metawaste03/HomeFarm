-- ============================================
-- DROP Community Tips tables (feature removed)
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================
-- Drop tip_votes first (has foreign key to tips)
DROP TABLE IF EXISTS tip_votes CASCADE;
-- Drop tips table
DROP TABLE IF EXISTS tips CASCADE;