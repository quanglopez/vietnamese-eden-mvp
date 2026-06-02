create table public.tags (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  name_normalized text not null,
  color text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tags_workspace_name_normalized_unique unique (workspace_id, name_normalized)
);

create trigger tags_set_updated_at
before update on public.tags
for each row execute function public.set_updated_at();

create table public.content_item_tags (
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (content_item_id, tag_id)
);

create index tags_workspace_id_idx on public.tags(workspace_id);
create index tags_workspace_normalized_idx on public.tags(workspace_id, name_normalized);
create index content_item_tags_item_idx on public.content_item_tags(content_item_id);
create index content_item_tags_tag_idx on public.content_item_tags(tag_id, content_item_id);

alter table public.tags enable row level security;
alter table public.content_item_tags enable row level security;

create policy "tags_select_member"
on public.tags for select
  using (public.is_workspace_member(workspace_id));

create policy "tags_insert_member"
on public.tags for insert
  with check (public.is_workspace_member(workspace_id));

create policy "tags_update_member"
on public.tags for update
  using (public.is_workspace_member(workspace_id))
  with check (public.is_workspace_member(workspace_id));

create policy "tags_delete_member"
on public.tags for delete
  using (public.is_workspace_member(workspace_id));

create policy "content_item_tags_select_member"
on public.content_item_tags for select
  using (
    exists (
      select 1
      from public.content_items ci
      where ci.id = content_item_id
        and public.is_workspace_member(ci.workspace_id)
    )
  );

create policy "content_item_tags_insert_member"
on public.content_item_tags for insert
  with check (
    exists (
      select 1
      from public.content_items ci
      join public.tags t on t.id = tag_id
      where ci.id = content_item_id
        and ci.workspace_id = t.workspace_id
        and public.is_workspace_member(ci.workspace_id)
    )
  );

create policy "content_item_tags_delete_member"
on public.content_item_tags for delete
  using (
    exists (
      select 1
      from public.content_items ci
      where ci.id = content_item_id
        and public.is_workspace_member(ci.workspace_id)
    )
  );

