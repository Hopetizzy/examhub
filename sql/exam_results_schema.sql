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

-- Users can insert their own results
create policy "Users can save their exam results"
  on public.exam_results for insert
  with check (auth.uid() = user_id);

-- Users can view their own results
create policy "Users can view their exam results"
  on public.exam_results for select
  using (auth.uid() = user_id);

-- Tutors can view results of their linked students
create policy "Tutors can view their students' results"
  on public.exam_results for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = exam_results.user_id
        and profiles.tutor_id = auth.uid()
    )
  );
