-- Add subscription columns to profiles table without dropping data
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_plan_id text DEFAULT 'plan_basic',
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS subscription_expiry timestamptz,
ADD COLUMN IF NOT EXISTS max_students int DEFAULT 5;

-- Update existing rows to have defaults if null
UPDATE public.profiles 
SET 
  subscription_plan_id = COALESCE(subscription_plan_id, 'plan_basic'),
  subscription_status = COALESCE(subscription_status, 'active'),
  max_students = COALESCE(max_students, 5)
WHERE role = 'tutor';

-- Policy to allow tutors to update their own subscription (for MVP client-side upgrade)
-- In a real app, this should be restricted to service_role or webhooks only
CREATE POLICY "Tutors can update own subscription" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
