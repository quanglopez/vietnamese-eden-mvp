-- ALE-173: Admin feedback inbox (NORM entries, manual import, no public access)

create table public.feedback_entries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  beta_tester_id uuid references public.beta_testers (id) on delete set null,
  created_by uuid references public.profiles (id) on delete set null,

  source text not null,
  source_ref text,
  reporter_name text,
  reporter_persona text,
  cohort text not null default 'cohort-2',

  raw_summary text not null,
  verbatim_quotes text[] not null default '{}'::text[],
  category text not null,
  priority text,
  status text not null default 'untriaged',

  linear_issue_id text,
  action_notes text,
  replied_to_user boolean not null default false,

  device text,
  reproducible text,
  notes text,

  triaged_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint feedback_entries_source_check check (
    source in ('google_form', 'manual_chat', 'email', 'dogfood', 'other')
  ),
  constraint feedback_entries_reporter_persona_check check (
    reporter_persona is null
    or reporter_persona in (
      'creator',
      'freelancer',
      'agency',
      'educator',
      'beauty_lifestyle',
      'other'
    )
  ),
  constraint feedback_entries_category_check check (
    category in ('bug', 'ux', 'fr', 'ai', 'price', 'positive')
  ),
  constraint feedback_entries_priority_check check (
    priority is null or priority in ('p0', 'p1', 'p2', 'p3')
  ),
  constraint feedback_entries_status_check check (
    status in ('untriaged', 'triaged', 'actioned', 'closed')
  ),
  constraint feedback_entries_device_check check (
    device is null or device in ('desktop', 'mobile', 'both', 'unknown')
  ),
  constraint feedback_entries_reproducible_check check (
    reproducible is null or reproducible in ('yes', 'no', 'not_tried')
  ),
  constraint feedback_entries_raw_summary_len check (char_length(trim(raw_summary)) >= 3)
);

create index feedback_entries_workspace_id_idx on public.feedback_entries (workspace_id);
create index feedback_entries_status_idx on public.feedback_entries (workspace_id, status);
create index feedback_entries_category_idx on public.feedback_entries (workspace_id, category);
create index feedback_entries_priority_idx on public.feedback_entries (workspace_id, priority);
create index feedback_entries_created_at_idx on public.feedback_entries (workspace_id, created_at desc);
create index feedback_entries_beta_tester_id_idx on public.feedback_entries (beta_tester_id);

create trigger feedback_entries_set_updated_at
before update on public.feedback_entries
for each row execute function public.set_updated_at();

comment on table public.feedback_entries is
  'Admin-managed beta feedback NORM entries. No public/anon access. Separate from beta_waitlist.';

alter table public.feedback_entries enable row level security;

create policy "feedback_entries_select_admin"
  on public.feedback_entries
  for select
  to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "feedback_entries_insert_admin"
  on public.feedback_entries
  for insert
  to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "feedback_entries_update_admin"
  on public.feedback_entries
  for update
  to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "feedback_entries_delete_admin"
  on public.feedback_entries
  for delete
  to authenticated
  using (public.is_workspace_admin(workspace_id));
