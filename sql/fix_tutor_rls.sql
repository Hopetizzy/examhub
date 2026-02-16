-- FIX TUTOR RLS POLICIES
-- This script ensures Tutors can view the data of their assigned students.

-- 1. Enable RLS on exam_results (just in case)
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing restrictive policy if it exists (to replace it or add to it)
-- We don't drop the "User Read Own Results" because we want BOTH to exist.
-- RLS policies are OR-ed together. If ANY policy says yes, access is granted.

-- 3. Add Tutor Policy for Exam Results
-- "A user can select rows from exam_results if the result belongs to a user who has this user as their tutor."
DROP POLICY IF EXISTS "Tutors read student results" ON exam_results;
CREATE POLICY "Tutors read student results" ON exam_results FOR SELECT USING (
  exists (
    select 1 from profiles 
    where profiles.id = exam_results.user_id 
    and profiles.tutor_id = auth.uid()
  )
);

-- 4. Add Tutor Policy for Profiles (Double check)
-- "A user can select rows from profiles if they are the tutor of that profile"
-- (Note: "Public Read Profiles" might already cover this, but this is safer/explicit)
DROP POLICY IF EXISTS "Tutors read student profiles" ON profiles;
CREATE POLICY "Tutors read student profiles" ON profiles FOR SELECT USING (
  tutor_id = auth.uid()
);
