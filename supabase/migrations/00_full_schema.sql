-- =============================================================================
-- SafeGround — run this ENTIRE file once in Supabase SQL Editor
-- Dashboard → SQL → New query → Paste → Run
-- Then: Database → Replication → enable anonymous_chat
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Profiles (extends auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  alias text,
  language text default 'en',
  support_mode text default 'secular',
  guardian_opt_in boolean default false,
  recovery_goal text,
  triggers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. Streaks
-- -----------------------------------------------------------------------------
create table if not exists public.streaks (
  user_id uuid primary key references auth.users (id) on delete cascade,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  total_clean_days integer not null default 0,
  last_logged_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.streaks enable row level security;

drop policy if exists "streaks_select_own" on public.streaks;
create policy "streaks_select_own"
  on public.streaks for select using (auth.uid() = user_id);

drop policy if exists "streaks_insert_own" on public.streaks;
create policy "streaks_insert_own"
  on public.streaks for insert with check (auth.uid() = user_id);

drop policy if exists "streaks_update_own" on public.streaks;
create policy "streaks_update_own"
  on public.streaks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. Habit logs (daily check-ins + panic sessions)
-- -----------------------------------------------------------------------------
create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  log_type text not null default 'daily'
    check (log_type in ('daily', 'panic', 'relapse')),
  mood smallint check (mood is null or (mood >= 1 and mood <= 5)),
  stress smallint,
  urge text,
  khat_used boolean default false,
  khat_hours_ago integer,
  alcohol_used boolean default false,
  triggers jsonb not null default '[]'::jsonb,
  notes text,
  ai_intervention_triggered boolean default false,
  intensity smallint,
  context_tags jsonb not null default '[]'::jsonb,
  status text check (status is null or status in ('active', 'held_ground', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habit_logs_user_created_idx
  on public.habit_logs (user_id, created_at desc);

alter table public.habit_logs enable row level security;

drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own"
  on public.habit_logs for select
  using (user_id is null or auth.uid() = user_id);

drop policy if exists "habit_logs_insert" on public.habit_logs;
create policy "habit_logs_insert"
  on public.habit_logs for insert
  with check (user_id is null or auth.uid() = user_id);

drop policy if exists "habit_logs_update_own" on public.habit_logs;
create policy "habit_logs_update_own"
  on public.habit_logs for update
  using (user_id is null or auth.uid() = user_id)
  with check (user_id is null or auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 4. Bookings (support directory)
-- -----------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  provider_id text not null,
  provider_name text not null,
  booking_date date not null,
  booking_time text not null,
  notes text,
  session_type text,
  meeting_link text,
  status text not null default 'confirmed',
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "bookings_select_own" on public.bookings;
create policy "bookings_select_own"
  on public.bookings for select using (auth.uid() = user_id);

drop policy if exists "bookings_insert_own" on public.bookings;
create policy "bookings_insert_own"
  on public.bookings for insert with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 5. Anonymous community chat
-- -----------------------------------------------------------------------------
create table if not exists public.anonymous_chat (
  id uuid primary key default gen_random_uuid(),
  room_id text not null check (room_id in ('global', 'crisis', 'faith')),
  message_type text not null default 'text'
    check (message_type in ('text', 'milestone_share', 'support_reaction')),
  content text not null,
  alias text not null default 'Anonymous',
  session_id text not null,
  reactions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists anonymous_chat_room_created_idx
  on public.anonymous_chat (room_id, created_at asc);

alter table public.anonymous_chat enable row level security;

drop policy if exists "anonymous_chat_select" on public.anonymous_chat;
create policy "anonymous_chat_select"
  on public.anonymous_chat for select using (true);

drop policy if exists "anonymous_chat_insert" on public.anonymous_chat;
create policy "anonymous_chat_insert"
  on public.anonymous_chat for insert with check (true);

drop policy if exists "anonymous_chat_update_reactions" on public.anonymous_chat;
create policy "anonymous_chat_update_reactions"
  on public.anonymous_chat for update using (true) with check (true);

-- -----------------------------------------------------------------------------
-- 6. Guardian links
-- -----------------------------------------------------------------------------
create table if not exists public.guardian_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  alias text not null,
  relationship text not null check (
    relationship in ('Parent', 'Sibling', 'Spouse', 'Mentor', 'Trusted Friend')
  ),
  monitoring_level text not null check (
    monitoring_level in ('Alert Only', 'Weekly Summary', 'Full View')
  ),
  notify_panic boolean not null default true,
  notify_relapse boolean not null default false,
  notify_streak_break boolean not null default false,
  token text not null unique,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists guardian_links_user_active_idx
  on public.guardian_links (user_id)
  where revoked_at is null;

alter table public.guardian_links enable row level security;

drop policy if exists "guardian_links_select_own" on public.guardian_links;
create policy "guardian_links_select_own"
  on public.guardian_links for select using (auth.uid() = user_id);

drop policy if exists "guardian_links_insert_own" on public.guardian_links;
create policy "guardian_links_insert_own"
  on public.guardian_links for insert with check (auth.uid() = user_id);

drop policy if exists "guardian_links_update_own" on public.guardian_links;
create policy "guardian_links_update_own"
  on public.guardian_links for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. Auto-create profile + streak on signup
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, alias)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'alias', new.raw_user_meta_data ->> 'display_name', 'Anonymous')
  )
  on conflict (id) do nothing;

  insert into public.streaks (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 8. Realtime for chat
-- -----------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public' and tablename = 'anonymous_chat'
  ) then
    alter publication supabase_realtime add table public.anonymous_chat;
  end if;
exception when undefined_object then null;
         when duplicate_object then null;
end $$;

-- -----------------------------------------------------------------------------
-- 9. Seed sample community milestones (guest echoes + chat demo)
-- -----------------------------------------------------------------------------
insert into public.anonymous_chat (room_id, message_type, content, alias, session_id)
select 'global', 'milestone_share', 'Day 30 clean. Grateful for this community — you are not alone.', 'HopefulFalcon', 'seed'
where not exists (select 1 from public.anonymous_chat where alias = 'HopefulFalcon' limit 1);

insert into public.anonymous_chat (room_id, message_type, content, alias, session_id)
select 'global', 'milestone_share', 'Prayed through the urge tonight. Still standing.', 'QuietRiver', 'seed'
where not exists (select 1 from public.anonymous_chat where alias = 'QuietRiver' limit 1);
