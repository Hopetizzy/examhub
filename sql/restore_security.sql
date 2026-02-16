
-- 1. Re-Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 2. Drop Old Policies (Clean Slate)
-- PROFILES
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins manage all profiles" ON profiles;
CREATE POLICY "Admins manage all profiles" ON profiles FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- QUESTIONS
DROP POLICY IF EXISTS "Everyone reads questions" ON questions;
CREATE POLICY "Everyone reads questions" ON questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage questions" ON questions;
CREATE POLICY "Admins manage questions" ON questions FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- TUTORIALS
DROP POLICY IF EXISTS "Everyone reads tutorials" ON tutorials;
CREATE POLICY "Everyone reads tutorials" ON tutorials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage tutorials" ON tutorials;
CREATE POLICY "Admins manage tutorials" ON tutorials FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- SYLLABUS
DROP POLICY IF EXISTS "Everyone reads syllabus" ON syllabus_topics;
CREATE POLICY "Everyone reads syllabus" ON syllabus_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins manage syllabus" ON syllabus_topics;
CREATE POLICY "Admins manage syllabus" ON syllabus_topics FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- EXAM RESULTS
DROP POLICY IF EXISTS "Users see own results" ON exam_results;
CREATE POLICY "Users see own results" ON exam_results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own results" ON exam_results;
CREATE POLICY "Users insert own results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all results" ON exam_results;
CREATE POLICY "Admins manage all results" ON exam_results FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);

-- PAYMENTS
DROP POLICY IF EXISTS "Users see own payments" ON payments;
CREATE POLICY "Users see own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins manage all payments" ON payments;
CREATE POLICY "Admins manage all payments" ON payments FOR ALL USING (
  exists (select 1 from profiles where id = auth.uid() and role = 'ADMIN')
);


-- 3. EMERGENCY ADMIN FIX (Promote Current User)
-- This block ensures YOU (the current user running this) become an ADMIN.
-- It inserts a profile for you if one doesn't exist.

INSERT INTO public.profiles (id, email, full_name, role)
VALUES (
  auth.uid(),                   -- Your Supabase User ID
  auth.email(),                 -- Your Email
  'Admin User',                 -- Placeholder Name
  'ADMIN'                       -- THE KEY ROLE
)
ON CONFLICT (id) DO UPDATE 
SET role = 'ADMIN';             -- If you exist, UPGRADE you to ADMIN.
