-- Create a table for system settings (key-value store for global configs)
create table public.system_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Policies
-- Everyone can view settings (needed for pricing display)
create policy "Everyone can view system settings"
  on public.system_settings for select
  using ( true );

-- Only admins can update settings (future proofing)
create policy "Admins can update system settings"
  on public.system_settings for update
  using ( 
    auth.uid() in (select id from public.profiles where role = 'admin') 
  );

-- Insert Default Pricing
insert into public.system_settings (key, value, description)
values 
  ('exam_pricing', '{"PRACTICE": 500, "TIMED": 1000}', 'Pricing for individual exam modes in Naira');
