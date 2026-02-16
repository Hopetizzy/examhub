-- FIX SCHEMA PERMISSIONS
-- Sometimes "Database error querying schema" means the API cannot access the 'public' schema itself.
-- This script explicitly grants necessary permissions.

-- 1. Grant Usage on Schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- 2. Grant Access to All Tables (Again, to be safe)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- 3. Grant Access to Sequences (Important for inserts)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. Reload Schema Cache (Notify PostgREST)
NOTIFY pgrst, 'reload config';
