-- ALE-167: Privacy-safe beta activation funnel events (no raw content in metadata)

create type public.analytics_event_type as enum (
  'signup',
  'login',
  'board_create',
  'content_add',
  'breakdown_run',
  'remix_run',
  'calendar_add'
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  workspace_id uuid references public.workspaces (id) on delete set null,
  event_type public.analytics_event_type not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index idx_analytics_events_event_type on public.analytics_events (event_type);
create index idx_analytics_events_created_at on public.analytics_events (created_at desc);
create index idx_analytics_events_workspace_id on public.analytics_events (workspace_id);
create index idx_analytics_events_user_id on public.analytics_events (user_id);

alter table public.analytics_events enable row level security;

-- Authenticated users may record their own events only
create policy "Users insert own analytics events"
  on public.analytics_events
  for insert
  to authenticated
  with check (user_id = auth.uid());

-- Workspace owners/admins may read events scoped to their workspace (cohort summaries)
create policy "Workspace admins read workspace analytics"
  on public.analytics_events
  for select
  to authenticated
  using (
    workspace_id is not null
    and public.is_workspace_admin(workspace_id)
  );

comment on table public.analytics_events is
  'Beta funnel events. Metadata must not contain raw content, titles, AI output, or secrets. '
  'signup/login rows typically have workspace_id null and are excluded from workspace admin SELECT.';
