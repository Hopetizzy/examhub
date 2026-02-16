-- Create Tutorials Table
create table if not exists public.tutorials (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  video_url text not null,
  description text,
  target_role text not null check (target_role in ('ALL', 'STUDENT', 'TUTOR')),
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  "order" integer default 0
);

-- Enable RLS
alter table public.tutorials enable row level security;

-- Policy: Everyone can view active tutorials relevant to them
-- For simplicity in this demo, we allow all authenticated users to read all tutorials, 
-- filtering will happen on the client or via refined queries.
create policy "Tutorials are viewable by everyone"
  on public.tutorials for select
  using (true);

-- Policy: Only Admins can insert/update/delete
-- Assuming an 'admin' role or specific user check. 
-- For now, we'll restrict to authenticated users who are likely admins, 
-- or you can replace this with a stricter check like:
-- auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
create policy "Admins can manage tutorials"
  on public.tutorials for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid()
      and role = 'ADMIN' 
    )
  );

-- Insert some sample data
insert into public.tutorials (title, video_url, description, target_role, "order")
values 
('Platform Overview', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'A quick tour of the platform features.', 'ALL', 1),
('How to Take an Exam', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Learn how to start and submit exams.', 'STUDENT', 2),
('Managing Students', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'Guide for tutors on managing their students.', 'TUTOR', 3);
