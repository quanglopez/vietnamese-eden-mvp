-- Health check table for Supabase connection verification (ALE-62)
create table if not exists public.health_check (
  id bigint generated always as identity primary key,
  status text not null default 'ok',
  checked_at timestamptz not null default now()
);

comment on table public.health_check is 'Connection health probe — anon read-only via RLS';

insert into public.health_check (status)
values ('ok');

alter table public.health_check enable row level security;

create policy "health_check_anon_select"
  on public.health_check
  for select
  to anon, authenticated
  using (true);

-- Deny writes from anon/authenticated (service role bypasses RLS for admin ops)
create policy "health_check_no_public_insert"
  on public.health_check
  for insert
  to anon, authenticated
  with check (false);

create policy "health_check_no_public_update"
  on public.health_check
  for update
  to anon, authenticated
  using (false);

create policy "health_check_no_public_delete"
  on public.health_check
  for delete
  to anon, authenticated
  using (false);
