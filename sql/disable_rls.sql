
-- DISABLE RLS FOR DEBUGGING (UPDATED)
-- This allows ALL access to EVERYONE. Use only for testing/prototyping.

-- 1. Disable RLS on ALL tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY; -- Added this!
ALTER TABLE syllabus_topics DISABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;

-- 2. Grant Permissions
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON exam_results TO authenticated;
GRANT ALL ON questions TO authenticated;
GRANT ALL ON syllabus_topics TO authenticated;
GRANT ALL ON tutorials TO authenticated;
GRANT ALL ON payments TO authenticated;

GRANT ALL ON profiles TO anon;
GRANT ALL ON exam_results TO anon;
GRANT ALL ON questions TO anon;
GRANT ALL ON syllabus_topics TO anon;
GRANT ALL ON tutorials TO anon;
GRANT ALL ON payments TO anon;
