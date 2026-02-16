-- SYNC ROLE TO METADATA & FIX RLS (The "Nuclear Option" against Recursion)

-- 1. Sync the 'ADMIN' role to auth.users metadata for the admin user
-- This allows us to check the role via auth.jwt() without querying the database tables!
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role": "ADMIN"}'::jsonb
WHERE email = 'admin@jambprep.com';

-- 2. Redefine is_admin() to check JWT Metadata
-- This function now does ZERO database lookups. It only checks the session token.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  -- Check if the 'role' claim in the JWT is 'ADMIN'
  -- Note: Supabase puts app_metadata in the JWT.
  -- usage: (auth.jwt() -> 'app_metadata' ->> 'role')
  RETURN (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN');
END;
$$;

-- 3. RESET RLS (Just to be sure)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 4. Re-Apply Policies (Using the new faster is_admin)

-- PROFILES
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON profiles;
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (is_admin());

-- QUESTIONS
DROP POLICY IF EXISTS "Everyone reads questions" ON questions;
CREATE POLICY "Everyone reads questions" ON questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage questions" ON questions;
CREATE POLICY "Admins manage questions" ON questions FOR ALL USING (is_admin());

-- TUTORIALS
DROP POLICY IF EXISTS "Everyone reads tutorials" ON tutorials;
CREATE POLICY "Everyone reads tutorials" ON tutorials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage tutorials" ON tutorials;
CREATE POLICY "Admins manage tutorials" ON tutorials FOR ALL USING (is_admin());

-- SYLLABUS
DROP POLICY IF EXISTS "Everyone reads syllabus" ON syllabus_topics;
CREATE POLICY "Everyone reads syllabus" ON syllabus_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage syllabus" ON syllabus_topics;
CREATE POLICY "Admins manage syllabus" ON syllabus_topics FOR ALL USING (is_admin());

-- EXAM RESULTS
DROP POLICY IF EXISTS "Users see own results" ON exam_results;
CREATE POLICY "Users see own results" ON exam_results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own results" ON exam_results;
CREATE POLICY "Users insert own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all results" ON exam_results;
CREATE POLICY "Admins manage all results" ON exam_results FOR ALL USING (is_admin());

-- PAYMENTS
DROP POLICY IF EXISTS "Users see own payments" ON payments;
CREATE POLICY "Users see own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own payments" ON payments;
CREATE POLICY "Users insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all payments" ON payments;
CREATE POLICY "Admins manage all payments" ON payments FOR ALL USING (is_admin());
