-- 1. PROFILES SCHEMA
-- Create table public.profiles (User provided structure)
create table if not exists public.profiles (
  id uuid references auth.users not null,
  email text not null,
  full_name text,
  surname text,
  role text check (role in ('student', 'tutor', 'individual', 'admin')) default 'student',
  is_tutor_registered boolean default false,
  tutor_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  
  primary key (id)
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Trigger to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, surname, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'surname',
    coalesce(new.raw_user_meta_data->>'role', 'individual') 
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 2. QUESTIONS SCHEMA
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

-- Policies
create policy "Enable read access for all users"
  on public.questions for select
  using (true);

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


-- 3. EXAM RESULTS SCHEMA
-- Create Exam Results Table
create table if not exists public.exam_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  exam_type text not null check (exam_type in ('JAMB', 'WAEC')), -- 'JAMB' or 'WAEC'
  mode text not null check (mode in ('TIMED', 'PRACTICE')), -- 'TIMED' or 'PRACTICE'
  score numeric not null default 0,
  total_questions int not null default 0,
  accuracy numeric not null default 0,
  time_spent_seconds int not null default 0,
  
  -- Detailed Analysis (stored as JSONB for flexibility)
  subjects jsonb, -- e.g. ["Mathematics", "English"]
  topic_breakdown jsonb, -- e.g. [{ "topic": "Algebra", "correct": 2, "total": 5 }]
  weak_areas jsonb, -- e.g. ["Algebra", "Calculus"]
  readiness_contribution jsonb, -- Stores the calculated readiness impact
  recommendation text,
  
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.exam_results enable row level security;

-- Policies
create policy "Users can save their exam results"
  on public.exam_results for insert
  with check (auth.uid() = user_id);

create policy "Users can view their exam results"
  on public.exam_results for select
  using (auth.uid() = user_id);

create policy "Tutors can view their students' results"
  on public.exam_results for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = exam_results.user_id
        and profiles.tutor_id = auth.uid()
    )
  );


-- 4. ASSIGNMENTS SCHEMA
-- Create Assignments Table
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  tutor_id uuid references public.profiles(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  config jsonb not null, -- Stores ExamConfig: { subjects: [], examType: '', mode: '' }
  status text check (status in ('PENDING', 'COMPLETED')) default 'PENDING',
  score numeric default 0,
  
  -- New fields for enhancements
  deadline timestamptz,
  duration_minutes int, -- Overrides default exam duration if set
  result_snapshot jsonb, -- Stores full ExamResult for detailed history/analysis
  
  assigned_date timestamptz default now(),
  completed_date timestamptz,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.assignments enable row level security;

-- Policies
create policy "Tutors can view their assignments"
  on public.assignments for select
  using (auth.uid() = tutor_id);

create policy "Tutors can create assignments"
  on public.assignments for insert
  with check (auth.uid() = tutor_id);

create policy "Students can view their assignments"
  on public.assignments for select
  using (auth.uid() = student_id);

create policy "Students can update their assignments"
  on public.assignments for update
  using (auth.uid() = student_id);


-- 5. SETTINGS SCHEMA
-- Create a table for system settings (key-value store for global configs)
create table if not exists public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies
create policy "Everyone can view system settings"
  on public.system_settings for select
  using ( true );

create policy "Admins can update system settings"
  on public.system_settings for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin') 
  );

-- Insert Default Pricing (Upsert to avoid errors if exists)
insert into public.system_settings (key, value, description)
values 
  ('exam_pricing', '{"PRACTICE": 500, "TIMED": 1000}', 'Pricing for individual exam modes in Naira')
on conflict (key) do nothing;

--first of all did you mention AI generate questions? never we are using questions from our database AI is not to generate any question its to make sure the students understand what dey are doing and after the exam it gives them their weakness and recomendation and where to focus on
--the exam page when be refresh it still load back to the dashboard pls fix that immediately its very important that feature works
