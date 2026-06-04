create table if not exists public.ai_rate_limits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null check (action in ('breakdown', 'remix', 'voice')),
  requested_at timestamptz not null default now()
);

create index if not exists ai_rate_limits_user_action_requested_at_idx
  on public.ai_rate_limits (user_id, action, requested_at desc);

alter table public.ai_rate_limits enable row level security;

create policy "Users can insert own AI rate limit rows"
  on public.ai_rate_limits
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can select own AI rate limit rows"
  on public.ai_rate_limits
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own AI rate limit rows"
  on public.ai_rate_limits
  for delete
  to authenticated
  using (user_id = auth.uid());

comment on table public.ai_rate_limits is 'Per-user AI request timestamps for beta abuse guard. Stores no raw content, prompts, IPs, or provider output.';
comment on column public.ai_rate_limits.action is 'AI-heavy action bucket: breakdown, remix, or voice.';
comment on column public.ai_rate_limits.requested_at is 'Timestamp used for rolling-window rate limit checks and 24h cleanup.';
