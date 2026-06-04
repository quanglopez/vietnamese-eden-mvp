-- ALE-172: Beta tester cohort tracker (admin-managed, workspace-scoped)

create type public.beta_persona as enum (
  'creator',
  'agency',
  'beauty_lifestyle',
  'educator_coach',
  'other'
);

create type public.beta_invite_status as enum (
  'pending',
  'invited',
  'accepted',
  'declined',
  'expired'
);

create type public.beta_signup_status as enum (
  'not_signed_up',
  'signed_up',
  'onboarded'
);

create type public.beta_core_flow_status as enum (
  'not_started',
  'in_progress',
  'completed',
  'partial'
);

create type public.beta_feedback_status as enum (
  'not_requested',
  'requested',
  'received',
  'n/a'
);

create table public.beta_testers (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  email text not null,
  full_name text,
  persona public.beta_persona not null default 'other',
  invite_status public.beta_invite_status not null default 'pending',
  signup_status public.beta_signup_status not null default 'not_signed_up',
  core_flow_status public.beta_core_flow_status not null default 'not_started',
  feedback_status public.beta_feedback_status not null default 'not_requested',
  user_id uuid references public.profiles (id) on delete set null,
  notes text,
  invited_at timestamptz,
  signed_up_at timestamptz,
  completed_at timestamptz,
  feedback_received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beta_testers_email_format check (trim(email) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint beta_testers_workspace_email_unique unique (workspace_id, email)
);

create index beta_testers_workspace_id_idx on public.beta_testers (workspace_id);
create index beta_testers_email_idx on public.beta_testers (lower(trim(email)));
create index beta_testers_user_id_idx on public.beta_testers (user_id);
create index beta_testers_persona_idx on public.beta_testers (persona);
create index beta_testers_invite_status_idx on public.beta_testers (invite_status);
create index beta_testers_signup_status_idx on public.beta_testers (signup_status);
create index beta_testers_core_flow_status_idx on public.beta_testers (core_flow_status);
create index beta_testers_feedback_status_idx on public.beta_testers (feedback_status);

create trigger beta_testers_set_updated_at
before update on public.beta_testers
for each row execute function public.set_updated_at();

comment on table public.beta_testers is
  'Beta tester cohort tracking — admin-managed per workspace. Separate from beta_waitlist.';

alter table public.beta_testers enable row level security;

create policy "beta_testers_select_admin"
  on public.beta_testers
  for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "beta_testers_insert_admin"
  on public.beta_testers
  for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "beta_testers_update_admin"
  on public.beta_testers
  for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "beta_testers_delete_admin"
  on public.beta_testers
  for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));
