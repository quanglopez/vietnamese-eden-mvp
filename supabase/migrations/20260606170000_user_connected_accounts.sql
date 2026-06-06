-- Per-user Composio OAuth connection mapping (provider tokens live in Composio, not Supabase)

create table if not exists public.user_connected_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null check (
    provider in (
      'facebook',
      'tiktok',
      'linkedin',
      'notion',
      'googlesheets',
      'telegram',
      'slack'
    )
  ),
  connected_account_id text not null,
  status text not null default 'initiated' check (
    status in ('initiated', 'active', 'failed', 'revoked')
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists user_connected_accounts_user_id_idx
  on public.user_connected_accounts (user_id);

create trigger user_connected_accounts_set_updated_at
before update on public.user_connected_accounts
for each row execute function public.set_updated_at();

alter table public.user_connected_accounts enable row level security;

create policy "user_connected_accounts_select_own"
  on public.user_connected_accounts
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "user_connected_accounts_insert_own"
  on public.user_connected_accounts
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "user_connected_accounts_update_own"
  on public.user_connected_accounts
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "user_connected_accounts_delete_own"
  on public.user_connected_accounts
  for delete
  to authenticated
  using (user_id = auth.uid());

comment on table public.user_connected_accounts is
  'Maps Eden users to Composio connected_account_id per provider. OAuth secrets stay in Composio.';

comment on column public.user_connected_accounts.connected_account_id is
  'Composio connected account identifier used when executing provider tools.';
