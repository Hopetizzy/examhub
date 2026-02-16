-- Allow Tutors to create notifications for students
-- This is necessary because by default RLS blocks inserts from one user (Tutor) to another (Student)

-- Policy: Tutors can insert into notifications table
do $$ 
begin
  if not exists (select from pg_policies where policyname = 'Tutors can create notifications') then
    create policy "Tutors can create notifications"
    on public.notifications
    for insert
    with check (
      exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'tutor'
      )
    );
  end if;
end $$;

-- Policy: Users can update their own notifications (e.g. mark as read)
do $$ 
begin
  if not exists (select from pg_policies where policyname = 'Users can update own notifications') then
    create policy "Users can update own notifications"
    on public.notifications
    for update
    using (auth.uid() = user_id);
  end if;
end $$;

-- Ensure metadata column exists (idempotent check)
alter table public.notifications 
add column if not exists metadata jsonb;

-- Ensure RLS is enabled
alter table public.notifications enable row level security;
