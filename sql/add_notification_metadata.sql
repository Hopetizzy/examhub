-- Create notifications table if it doesn't exist (Safety check)
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  title text not null,
  message text not null,
  type text check (type in ('INFO', 'SUCCESS', 'WARNING', 'ERROR')) default 'INFO',
  is_read boolean default false,
  link text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.notifications enable row level security;

-- Policies (safe to re-run due to 'if not exists' check implicitly or error ignoring)
do $$ 
begin
  if not exists (select from pg_policies where policyname = 'Users can view own notifications') then
    create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
  end if;
end $$;

-- Add metadata column for flexible attributes like 'isPopup'
alter table public.notifications 
add column if not exists metadata jsonb;

comment on column public.notifications.metadata is 'Stores extra data like { isPopup: true } for bulk messages';
