-- Guardian invite links (authenticated users)
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

create policy "guardian_links_select_own"
  on public.guardian_links for select
  using (auth.uid() = user_id);

create policy "guardian_links_insert_own"
  on public.guardian_links for insert
  with check (auth.uid() = user_id);

create policy "guardian_links_update_own"
  on public.guardian_links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
