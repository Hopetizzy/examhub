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

-- Policies for Assignments

-- Tutors can view assignments they created
create policy "Tutors can view their assignments"
  on public.assignments for select
  using (auth.uid() = tutor_id);

-- Tutors can insert assignments for their students
create policy "Tutors can create assignments"
  on public.assignments for insert
  with check (auth.uid() = tutor_id);

-- Students can view assignments assigned to them
create policy "Students can view their assignments"
  on public.assignments for select
  using (auth.uid() = student_id);

-- Students can update their assignments (e.g. mark complete)
create policy "Students can update their assignments"
  on public.assignments for update
  using (auth.uid() = student_id);
