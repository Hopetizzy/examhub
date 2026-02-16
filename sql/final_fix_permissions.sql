-- FINAL PERMISSION FIX (Solves Recursion & Access Issues)

-- 1. Create SECURITY DEFINER function to safely check Admin role
-- This runs with the privileges of the creator (postgres), bypassing RLS recursion.
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  );
END;
$$;

-- 2. RESET RLS on All Tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 3. DROP ALL EXISTING POLICIES (Clean Slate)
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON profiles;

DROP POLICY IF EXISTS "Everyone reads questions" ON questions;
DROP POLICY IF EXISTS "Admins manage questions" ON questions;

DROP POLICY IF EXISTS "Everyone reads tutorials" ON tutorials;
DROP POLICY IF EXISTS "Admins manage tutorials" ON tutorials;

DROP POLICY IF EXISTS "Everyone reads syllabus" ON syllabus_topics;
DROP POLICY IF EXISTS "Admins manage syllabus" ON syllabus_topics;

DROP POLICY IF EXISTS "Users see own results" ON exam_results;
DROP POLICY IF EXISTS "Users insert own results" ON exam_results;
DROP POLICY IF EXISTS "Admins manage all results" ON exam_results;

DROP POLICY IF EXISTS "Users see own payments" ON payments;
DROP POLICY IF EXISTS "Admins manage all payments" ON payments;

-- 4. APPLY NEW SAFE POLICIES

-- === PROFILES ===
-- Allow users to view all profiles (needed for Tutors finding Students, Leaderboards, etc.)
-- Safe because it doesn't check role recursively.
CREATE POLICY "Profiles viewable by authenticated" ON profiles FOR SELECT TO authenticated USING (true);

-- Users can update ONLY their own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can do ANYTHING (using safe function)
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (is_admin());


-- === QUESTIONS ===
CREATE POLICY "Everyone reads questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Admins manage questions" ON questions FOR ALL USING (is_admin());

-- === TUTORIALS ===
CREATE POLICY "Everyone reads tutorials" ON tutorials FOR SELECT USING (true);
CREATE POLICY "Admins manage tutorials" ON tutorials FOR ALL USING (is_admin());

-- === SYLLABUS ===
CREATE POLICY "Everyone reads syllabus" ON syllabus_topics FOR SELECT USING (true);
CREATE POLICY "Admins manage syllabus" ON syllabus_topics FOR ALL USING (is_admin());

-- === EXAM RESULTS ===
CREATE POLICY "Users see own results" ON exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all results" ON exam_results FOR ALL USING (is_admin());

-- === PAYMENTS ===
CREATE POLICY "Users see own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all payments" ON payments FOR ALL USING (is_admin());

-- 5. GRANT PERMISSIONS (Just in case)
GRANT EXECUTE ON FUNCTION public.is_admin TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin TO service_role;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
