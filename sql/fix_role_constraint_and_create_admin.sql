-- FIX ROLE CONSTRAINT & CREATE ADMIN (Fixed for Triggers)
-- The previous error (duplicate key in profiles) happened because auth.users insert AUTOMATICALLY triggers a profiles insert.
-- We must NOT insert into profiles manually, but rather UPDATE the role.

-- 1. Relax Role Constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
  'STUDENT', 'TUTOR', 'INDIVIDUAL', 'ADMIN', 
  'student', 'tutor', 'individual', 'admin'
));

-- 2. Create User & Ensure Admin Role
DO $$
DECLARE
  new_uid uuid := gen_random_uuid();
  user_exists uuid;
BEGIN
  -- Check if user exists
  SELECT id INTO user_exists FROM auth.users WHERE email = 'admin@jambprep.com';

  IF user_exists IS NULL THEN
      -- Insert into auth.users
      -- This will fire the 'on_auth_user_created' trigger which creates the profile!
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at
      ) VALUES (
        '00000000-0000-0000-0000-000000000000', new_uid, 'authenticated', 'authenticated', 
        'admin@jambprep.com', crypt('master-admin-2026', gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}', '{"full_name": "System Admin"}', now(), now()
      );
      
      -- Update the AUTOMATICALLY created profile to ensure role is ADMIN
      -- Since trigger happened, profile exists for new_uid
      UPDATE public.profiles 
      SET role = 'ADMIN', full_name = 'System Admin' 
      WHERE id = new_uid;
      
      RAISE NOTICE 'Admin user created successfully.';
  ELSE
      RAISE NOTICE 'Admin user already exists. Updating role to ADMIN.';
      -- Ensure existing user is ADMIN
      UPDATE public.profiles 
      SET role = 'ADMIN' 
      WHERE id = user_exists;
  END IF;
END $$;
