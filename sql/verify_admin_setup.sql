-- VERIFY ADMIN SETUP
-- Run this to check if the admin user exists and is linked correctly.

DO $$
DECLARE
  v_user_id uuid;
  v_email text := 'admin@jambprep.com';
  v_profile_role text;
  v_meta_role text;
BEGIN
  RAISE NOTICE '--- STARTING VERIFICATION ---';

  -- 1. Check auth.users
  SELECT id, raw_app_meta_data->>'role' INTO v_user_id, v_meta_role
  FROM auth.users 
  WHERE email = v_email;

  IF v_user_id IS NULL THEN
    RAISE NOTICE '❌ ERROR: Admin user % NOT FOUND in auth.users!', v_email;
  ELSE
    RAISE NOTICE '✅ OK: Admin user found in auth.users. ID: %', v_user_id;
    RAISE NOTICE 'ℹ️ Metadata Role: %', COALESCE(v_meta_role, 'NULL');
  END IF;

  -- 2. Check public.profiles
  SELECT role INTO v_profile_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_profile_role IS NULL THEN
    RAISE NOTICE '❌ ERROR: Admin profile NOT FOUND in public.profiles for ID: %', v_user_id;
  ELSE
    RAISE NOTICE '✅ OK: Admin profile found. Role: %', v_profile_role;
  END IF;

  -- 3. Check Schema Permissions (Simulation)
  -- We can't easily impersonate via DO block without set role, but we can check grants.
  -- This is just an info check.
  
  RAISE NOTICE '--- PERMISSION CHECK ---';
  
  IF has_schema_privilege('anon', 'public', 'USAGE') THEN
    RAISE NOTICE '✅ OK: Anon has USAGE on public schema.';
  ELSE
    RAISE NOTICE '❌ ERROR: Anon indicates NO USAGE on public schema.';
  END IF;

  IF has_schema_privilege('authenticated', 'public', 'USAGE') THEN
    RAISE NOTICE '✅ OK: Authenticated has USAGE on public schema.';
  ELSE
    RAISE NOTICE '❌ ERROR: Authenticated indicates NO USAGE on public schema.';
  END IF;

  RAISE NOTICE '--- END VERIFICATION ---';
END $$;
