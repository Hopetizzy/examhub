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

-- yeah proceed but won't we need a table where we submit the student assignmet and all so they can view history? and also every othe thing that you feel like we can sve in the database so we can fetch those data and use it in the tutor dashboard and also as history and analysis?