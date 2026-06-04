-- Enable Realtime for anonymous_chat (safe to re-run)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'anonymous_chat'
  ) then
    alter publication supabase_realtime add table public.anonymous_chat;
  end if;
exception
  when undefined_object then
    null;
  when duplicate_object then
    null;
end $$;
