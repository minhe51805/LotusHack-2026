-- ============================================================================
-- Make all tables publicly accessible (no RLS)
-- Run this in the Supabase SQL editor.
-- ============================================================================

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all on schools" ON schools;
DROP POLICY IF EXISTS "Allow all on courses" ON courses;
DROP POLICY IF EXISTS "Allow all on services" ON services;
DROP POLICY IF EXISTS "Allow all on settings" ON settings;
DROP POLICY IF EXISTS "Allow all on sessions" ON sessions;

-- Disable RLS entirely on all tables
ALTER TABLE schools DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Grant full access to anon and authenticated roles
GRANT ALL ON schools  TO anon, authenticated;
GRANT ALL ON courses  TO anon, authenticated;
GRANT ALL ON services TO anon, authenticated;
GRANT ALL ON settings TO anon, authenticated;
GRANT ALL ON sessions TO anon, authenticated;
