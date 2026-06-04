-- Anonymous community chat (Realtime + Presence)
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

create policy "anonymous_chat_select"
  on public.anonymous_chat for select
  using (true);

create policy "anonymous_chat_insert"
  on public.anonymous_chat for insert
  with check (true);

create policy "anonymous_chat_update_reactions"
  on public.anonymous_chat for update
  using (true)
  with check (true);

-- Enable Realtime in Supabase Dashboard → Database → Replication → anonymous_chat
-- Or run: alter publication supabase_realtime add table public.anonymous_chat;
