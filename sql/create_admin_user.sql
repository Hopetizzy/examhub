-- Create Admin User (admin@jambprep.com / admin123)
-- Run this in Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  new_uid uuid := gen_random_uuid();
BEGIN
  -- 1. check if user already exists to avoid dupes (optional safety)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@jambprep.com') THEN
      
      -- 2. Insert into auth.users
      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_uid,
        'authenticated',
        'authenticated',
        'admin@jambprep.com',
        crypt('master-admin-2026', gen_salt('bf')), -- Password: admin123
        now(), -- Confirmed
        '{"provider":"email","providers":["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
      );

      -- 3. Insert into public.profiles
      INSERT INTO public.profiles (id, email, full_name, role)
      VALUES (
        new_uid,
        'admin@jambprep.com',
        'System Admin',
        'ADMIN'
      );
      
      RAISE NOTICE 'Admin user created: admin@jambprep.com / master-admin-2026';
  ELSE
      RAISE NOTICE 'User admin@jambprep.com already exists. Skipping creation.';
  END IF;
END $$;
