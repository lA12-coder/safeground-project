-- Add email and user_id columns to providers table for auth integration
alter table public.providers
  add column if not exists email text,
  add column if not exists user_id uuid references auth.users(id) on delete set null;

-- Index for faster lookups by email and user_id
create index if not exists idx_providers_email on public.providers(email);
create index if not exists idx_providers_user_id on public.providers(user_id);

comment on column public.providers.email is 'Contact email used for granting portal access';
comment on column public.providers.user_id is 'Link to auth.users — set when admin grants portal access';
