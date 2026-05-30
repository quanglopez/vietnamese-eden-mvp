-- ALE-63: Vietnamese Eden MVP — initial schema (10 tables)
-- profiles, workspaces, workspace_members, boards, content_items,
-- board_content_items, content_analyses, voice_profiles,
-- generated_outputs, content_calendar_items

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.platform_type as enum (
  'tiktok',
  'facebook',
  'instagram',
  'youtube',
  'other'
);

create type public.workspace_role as enum (
  'owner',
  'admin',
  'member'
);

create type public.analysis_status as enum (
  'pending',
  'completed',
  'failed'
);

create type public.output_status as enum (
  'draft',
  'ready',
  'published',
  'archived'
);

create type public.calendar_status as enum (
  'scheduled',
  'published',
  'skipped',
  'failed'
);

-- ---------------------------------------------------------------------------
-- Helpers (table-independent)
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

comment on table public.profiles is 'User profile extending auth.users';

-- ---------------------------------------------------------------------------
-- 2. workspaces
-- ---------------------------------------------------------------------------

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workspaces_slug_format check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create unique index workspaces_slug_key on public.workspaces (slug);
create index workspaces_owner_id_idx on public.workspaces (owner_id);

create trigger workspaces_set_updated_at
before update on public.workspaces
for each row execute function public.set_updated_at();

comment on table public.workspaces is 'Personal or agency workspace';

-- ---------------------------------------------------------------------------
-- 3. workspace_members
-- ---------------------------------------------------------------------------

create table public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.workspace_role not null default 'member',
  joined_at timestamptz not null default now(),
  constraint workspace_members_unique unique (workspace_id, user_id)
);

create index workspace_members_user_id_idx on public.workspace_members (user_id);
create index workspace_members_workspace_id_idx on public.workspace_members (workspace_id);

comment on table public.workspace_members is 'Workspace membership and roles';

-- ---------------------------------------------------------------------------
-- 4. boards
-- ---------------------------------------------------------------------------

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text,
  color text,
  sort_order integer not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index boards_workspace_id_idx on public.boards (workspace_id);
create index boards_workspace_sort_idx on public.boards (workspace_id, sort_order);

create trigger boards_set_updated_at
before update on public.boards
for each row execute function public.set_updated_at();

comment on table public.boards is 'Swipe boards for organizing viral content';

-- ---------------------------------------------------------------------------
-- 5. content_items
-- ---------------------------------------------------------------------------

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  platform public.platform_type not null default 'other',
  source_url text,
  raw_content text,
  author_name text,
  saved_by uuid references public.profiles (id) on delete set null,
  saved_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index content_items_workspace_id_idx on public.content_items (workspace_id);
create index content_items_platform_idx on public.content_items (workspace_id, platform);
create index content_items_saved_at_idx on public.content_items (workspace_id, saved_at desc);

create trigger content_items_set_updated_at
before update on public.content_items
for each row execute function public.set_updated_at();

comment on table public.content_items is 'Saved viral content items';

-- ---------------------------------------------------------------------------
-- 6. board_content_items
-- ---------------------------------------------------------------------------

create table public.board_content_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  sort_order integer not null default 0,
  added_by uuid references public.profiles (id) on delete set null,
  added_at timestamptz not null default now(),
  constraint board_content_items_unique unique (board_id, content_item_id)
);

create index board_content_items_board_idx on public.board_content_items (board_id, sort_order);
create index board_content_items_content_idx on public.board_content_items (content_item_id);

comment on table public.board_content_items is 'Many-to-many link between boards and content';

-- ---------------------------------------------------------------------------
-- 7. content_analyses
-- ---------------------------------------------------------------------------

create table public.content_analyses (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  hook text,
  angle text,
  structure text,
  cta text,
  summary text,
  ai_model text,
  status public.analysis_status not null default 'pending',
  analyzed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_analyses_content_item_unique unique (content_item_id)
);

create index content_analyses_workspace_id_idx on public.content_analyses (workspace_id);
create index content_analyses_status_idx on public.content_analyses (workspace_id, status);

create trigger content_analyses_set_updated_at
before update on public.content_analyses
for each row execute function public.set_updated_at();

comment on table public.content_analyses is 'AI breakdown: Hook, Angle, Structure, CTA';

-- ---------------------------------------------------------------------------
-- 8. voice_profiles
-- ---------------------------------------------------------------------------

create table public.voice_profiles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  tone text,
  style_notes text,
  sample_count integer not null default 0,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index voice_profiles_workspace_user_idx on public.voice_profiles (workspace_id, user_id);
create unique index voice_profiles_one_default_per_user
  on public.voice_profiles (workspace_id, user_id)
  where is_default = true;

create trigger voice_profiles_set_updated_at
before update on public.voice_profiles
for each row execute function public.set_updated_at();

comment on table public.voice_profiles is 'Personal writing voice profiles';

-- ---------------------------------------------------------------------------
-- 9. generated_outputs
-- ---------------------------------------------------------------------------

create table public.generated_outputs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  source_content_item_id uuid references public.content_items (id) on delete set null,
  voice_profile_id uuid references public.voice_profiles (id) on delete set null,
  title text,
  content text not null,
  status public.output_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index generated_outputs_workspace_id_idx on public.generated_outputs (workspace_id);
create index generated_outputs_status_idx on public.generated_outputs (workspace_id, status);
create index generated_outputs_source_idx on public.generated_outputs (source_content_item_id);

create trigger generated_outputs_set_updated_at
before update on public.generated_outputs
for each row execute function public.set_updated_at();

comment on table public.generated_outputs is 'AI remix / generated content outputs';

-- ---------------------------------------------------------------------------
-- 10. content_calendar_items
-- ---------------------------------------------------------------------------

create table public.content_calendar_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  generated_output_id uuid references public.generated_outputs (id) on delete set null,
  content_item_id uuid references public.content_items (id) on delete set null,
  title text not null,
  platform public.platform_type not null default 'other',
  scheduled_at timestamptz not null,
  status public.calendar_status not null default 'scheduled',
  notes text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint content_calendar_items_has_source check (
    generated_output_id is not null or content_item_id is not null
  )
);

create index content_calendar_workspace_scheduled_idx
  on public.content_calendar_items (workspace_id, scheduled_at);
create index content_calendar_status_idx
  on public.content_calendar_items (workspace_id, status);

create trigger content_calendar_items_set_updated_at
before update on public.content_calendar_items
for each row execute function public.set_updated_at();

comment on table public.content_calendar_items is 'Scheduled publishing calendar entries';

-- ---------------------------------------------------------------------------
-- RLS helpers (after tables exist)
-- ---------------------------------------------------------------------------

create or replace function public.is_workspace_member(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_admin(p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create or replace function public.handle_new_workspace()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'owner');
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Auth & workspace triggers
-- ---------------------------------------------------------------------------

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger on_workspace_created
after insert on public.workspaces
for each row execute function public.handle_new_workspace();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.boards enable row level security;
alter table public.content_items enable row level security;
alter table public.board_content_items enable row level security;
alter table public.content_analyses enable row level security;
alter table public.voice_profiles enable row level security;
alter table public.generated_outputs enable row level security;
alter table public.content_calendar_items enable row level security;

-- profiles
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- workspaces
create policy "workspaces_select_member"
  on public.workspaces for select to authenticated
  using (public.is_workspace_member(id));

create policy "workspaces_insert_owner"
  on public.workspaces for insert to authenticated
  with check (owner_id = auth.uid());

create policy "workspaces_update_admin"
  on public.workspaces for update to authenticated
  using (public.is_workspace_admin(id))
  with check (public.is_workspace_admin(id));

create policy "workspaces_delete_owner"
  on public.workspaces for delete to authenticated
  using (
    owner_id = auth.uid()
    or public.is_workspace_admin(id)
  );

-- workspace_members
create policy "workspace_members_select_member"
  on public.workspace_members for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "workspace_members_insert_admin"
  on public.workspace_members for insert to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_members_update_admin"
  on public.workspace_members for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "workspace_members_delete_admin_or_self"
  on public.workspace_members for delete to authenticated
  using (
    public.is_workspace_admin(workspace_id)
    or user_id = auth.uid()
  );

-- boards
create policy "boards_select_member"
  on public.boards for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "boards_insert_member"
  on public.boards for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "boards_update_member"
  on public.boards for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "boards_delete_member"
  on public.boards for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- content_items
create policy "content_items_select_member"
  on public.content_items for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "content_items_insert_member"
  on public.content_items for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "content_items_update_member"
  on public.content_items for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "content_items_delete_member"
  on public.content_items for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- board_content_items (via board workspace)
create policy "board_content_items_select_member"
  on public.board_content_items for select to authenticated
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_id
        and public.is_workspace_member(b.workspace_id)
    )
  );

create policy "board_content_items_insert_member"
  on public.board_content_items for insert to authenticated
  with check (
    exists (
      select 1 from public.boards b
      where b.id = board_id
        and public.is_workspace_member(b.workspace_id)
    )
  );

create policy "board_content_items_update_member"
  on public.board_content_items for update to authenticated
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_id
        and public.is_workspace_member(b.workspace_id)
    )
  );

create policy "board_content_items_delete_member"
  on public.board_content_items for delete to authenticated
  using (
    exists (
      select 1 from public.boards b
      where b.id = board_id
        and public.is_workspace_member(b.workspace_id)
    )
  );

-- content_analyses
create policy "content_analyses_select_member"
  on public.content_analyses for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "content_analyses_insert_member"
  on public.content_analyses for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "content_analyses_update_member"
  on public.content_analyses for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "content_analyses_delete_member"
  on public.content_analyses for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- voice_profiles
create policy "voice_profiles_select_member"
  on public.voice_profiles for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "voice_profiles_insert_member"
  on public.voice_profiles for insert to authenticated
  with check (
    public.is_workspace_member(workspace_id)
    and user_id = auth.uid()
  );

create policy "voice_profiles_update_owner"
  on public.voice_profiles for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "voice_profiles_delete_owner"
  on public.voice_profiles for delete to authenticated
  using (user_id = auth.uid());

-- generated_outputs
create policy "generated_outputs_select_member"
  on public.generated_outputs for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "generated_outputs_insert_member"
  on public.generated_outputs for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "generated_outputs_update_member"
  on public.generated_outputs for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "generated_outputs_delete_member"
  on public.generated_outputs for delete to authenticated
  using (public.is_workspace_member(workspace_id));

-- content_calendar_items
create policy "content_calendar_items_select_member"
  on public.content_calendar_items for select to authenticated
  using (public.is_workspace_member(workspace_id));

create policy "content_calendar_items_insert_member"
  on public.content_calendar_items for insert to authenticated
  with check (public.is_workspace_member(workspace_id));

create policy "content_calendar_items_update_member"
  on public.content_calendar_items for update to authenticated
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "content_calendar_items_delete_member"
  on public.content_calendar_items for delete to authenticated
  using (public.is_workspace_member(workspace_id));
