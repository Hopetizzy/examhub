-- RECREATE ADMIN USER (Nuclear Option ☢️)
-- This script DELETES the admin user and recreates them from scratch.
-- This guarantees they exist in auth.users AND public.profiles.

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. DELETE existing admin (Clean Slate)
-- We delete from profiles first (foreign key), then auth.users.
DELETE FROM public.profiles WHERE email = 'admin@jambprep.com';
DELETE FROM auth.users WHERE email = 'admin@jambprep.com';

-- 3. INSERT into auth.users (The Login Account)
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
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Fixed UUID for Admin
    'authenticated',
    'authenticated',
    'admin@jambprep.com',
    crypt('admin123', gen_salt('bf')), -- Password: admin123
    now(), -- Auto-confirm
    '{"provider":"email","providers":["email"],"role":"ADMIN"}', -- App Metadata (Critical for our RLS fix)
    '{"full_name":"System Admin","role":"ADMIN"}', -- User Metadata
    now(),
    now(),
    '',
    '',
    '',
    ''
);

-- 4. INSERT into public.profiles (The App Profile)
-- Validating that we don't rely on triggers here, doing it manually to be safe.
INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    has_free_access
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', -- Matches auth.users ID
    'admin@jambprep.com',
    'System Admin',
    'ADMIN',
    true
)
ON CONFLICT (id) DO UPDATE
SET role = 'ADMIN', has_free_access = true;

-- 5. VERIFY (This will return a row you can see)
SELECT id, email, role FROM public.profiles WHERE email = 'admin@jambprep.com';
