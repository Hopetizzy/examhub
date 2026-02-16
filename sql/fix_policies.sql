-- Fix Payments RLS: Allow authenticated users to insert their own payments
create policy "Users can insert own payments"
  on public.payments for insert
  with check ( auth.uid() = user_id );

-- Ensure Profiles are readable by everyone (or at least same user) - existing policy handles this.
-- But let's verify if 'tutor_id' update is allowed for assigning students.
-- Tutors need to update 'tutor_id' of a student? No, usually set on creation.

-- Fix: Grant basic permissions just in case
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to postgres, service_role;
grant select, insert, update on all tables in schema public to authenticated;

-- Add a check to ensure email is valid (basic constraint) if desired, but code handles it.
-- alter table public.profiles add constraint email_check check (email ~* '^.+@.+\..+$');
