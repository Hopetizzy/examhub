-- Create the questions table
create table if not exists public.questions (
  id uuid default gen_random_uuid() primary key,
  exam_type text not null, -- 'JAMB', 'WAEC'
  subject text not null, -- 'Mathematics', 'English', etc.
  topic text not null,
  sub_topic text, -- optional, for finer granularity
  content jsonb not null, -- { text: "...", options: [...], correctOptionId: "...", explanation: "..." }
  difficulty text default 'MEDIUM', -- 'EASY', 'MEDIUM', 'HARD'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.questions enable row level security;

-- Policy: Everyone can read questions (needed for students taking exams)
-- You might want to restrict this to authenticated users only in production
create policy "Enable read access for all users"
  on public.questions for select
  using (true);

-- Policy: Only Admins can insert/update/delete
-- Assuming 'admin' role in public.profiles or via Supabase Auth metadata
-- For now, we'll check if the user has a custom claim or is just authenticated. 
-- Ideally, you'd check a "roles" table or metadata.
-- Let's assume a simplified "is_admin" function or check against a specific email for bootstrap.

-- BETTER APPROACH for this stage: Allow authenticated users with 'ADMIN' role in public.profiles (if it exists)
-- Checking types.ts, UserRole = 'STUDENT' | 'TUTOR' | 'INDIVIDUAL' | 'ADMIN'
-- And Profile has 'role' field.

create policy "Enable write access for admins only"
  on public.questions for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
  
-- Create index for faster random fetching by subject
create index if not exists idx_questions_subject on public.questions(subject);
create index if not exists idx_questions_exam_type on public.questions(exam_type);
