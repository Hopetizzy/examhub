-- CLEAN & SECURE RLS (The Final Polish)
-- This script dynamically removes ALL existing policies (ghosts included) 
-- and applies the new, safe rules.

DO $$
DECLARE
  r RECORD;
BEGIN
  -- 1. LOOP through ALL policies on our tables and DROP them
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE tablename IN ('profiles', 'questions', 'tutorials', 'syllabus_topics', 'exam_results', 'payments')
  ) LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON "' || r.schemaname || '"."' || r.tablename || '";';
  END LOOP;
END $$;

-- 2. Re-Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 3. Apply Safe Policies (Metadata Based)

-- PROFILES
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "User Update Self" ON profiles FOR UPDATE USING (auth.uid() = id);
-- SUPER SAFE: Hardcoded Email Check to prevent ANY recursion or metadata sync issues
CREATE POLICY "Admin All Profiles" ON profiles FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);

-- QUESTIONS
CREATE POLICY "Public Read Questions" ON questions FOR SELECT USING (true);
CREATE POLICY "Admin Manage Questions" ON questions FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);

-- TUTORIALS
CREATE POLICY "Public Read Tutorials" ON tutorials FOR SELECT USING (true);
CREATE POLICY "Admin Manage Tutorials" ON tutorials FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);

-- SYLLABUS
CREATE POLICY "Public Read Syllabus" ON syllabus_topics FOR SELECT USING (true);
CREATE POLICY "Admin Manage Syllabus" ON syllabus_topics FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);

-- EXAM RESULTS
CREATE POLICY "User Read Own Results" ON exam_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Insert Own Results" ON exam_results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin Manage Results" ON exam_results FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);

-- PAYMENTS
CREATE POLICY "User Read Own Payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User Insert Own Payments" ON payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin Manage Payments" ON payments FOR ALL USING (
  (auth.jwt() ->> 'email') = 'admin@jambprep.com'
);
