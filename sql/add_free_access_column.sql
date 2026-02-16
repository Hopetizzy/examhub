
-- Add has_free_access column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_free_access BOOLEAN DEFAULT FALSE;

-- Update RLS policies to allow Admins to update this column
-- (Assuming existing policies allow update based on ID, we might need a specific policy for Admins if not present)
-- For now, we rely on the service using specific admin functions or RLS allowing updates.
