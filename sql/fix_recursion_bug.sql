
-- 1. Create a Helper Function (bypass RLS)
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER -- Bypasses RLS to avoid recursion
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  );
END;
$$;

-- 2. Drop Old Policies (to be safe)
DROP POLICY IF EXISTS "Admins manage all" ON profiles;
DROP POLICY IF EXISTS "Profiles viewable by authenticated" ON profiles;
DROP POLICY IF EXISTS "Admins can view all exams" ON exam_results;

-- 3. Re-Apply Correct Policies (Using the safe function)

-- Profiles: Authenticated users can view basic info (e.g. for leaderboards/tutors)
CREATE POLICY "Profiles viewable by authenticated" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Profiles: Admins can do ANYTHING (Create/Update/Delete)
CREATE POLICY "Admins manage all profiles" 
ON profiles FOR ALL 
USING (is_admin());

-- Exams: Users see their own
CREATE POLICY "Users see own exams" 
ON exam_results FOR SELECT 
USING (auth.uid() = user_id);

-- Exams: Admins see ALL exams (for Analytics)
CREATE POLICY "Admins see all exams" 
ON exam_results FOR SELECT 
USING (is_admin());

-- Payments: Users see own
CREATE POLICY "Users see own payments" 
ON payments FOR SELECT 
USING (auth.uid() = user_id);

-- Payments: Admins see ALL
CREATE POLICY "Admins see all payments" 
ON payments FOR SELECT 
USING (is_admin());
