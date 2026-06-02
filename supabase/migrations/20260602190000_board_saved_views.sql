-- ALE-163: Saved board views
-- board_saved_views: lưu preset filter/search cho từng board (per-workspace)

create table public.board_saved_views (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  search_query text,
  -- Lưu theo state UI hiện tại (BoardDetailView) => có "linkedin" (không nằm trong platform_type enum).
  -- null = all platforms
  platform_filters text[],
  -- null = all tags
  tag_filters uuid[],
  -- placeholder cho tương lai (sort UI chưa implement)
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint board_saved_views_board_name_unique unique (board_id, name)
);

create index board_saved_views_board_id_idx on public.board_saved_views(board_id);
create index board_saved_views_workspace_id_idx on public.board_saved_views(workspace_id);
create index board_saved_views_created_by_idx on public.board_saved_views(created_by);

create trigger board_saved_views_set_updated_at
before update on public.board_saved_views
for each row execute function public.set_updated_at();

alter table public.board_saved_views enable row level security;

create policy "board_saved_views_select_member"
on public.board_saved_views for select
  using (public.is_workspace_member(workspace_id));

create policy "board_saved_views_insert_member"
on public.board_saved_views for insert
  with check (
    public.is_workspace_member(workspace_id)
    and created_by = auth.uid()
    and exists (
      select 1
      from public.boards b
      where b.id = board_id
        and b.workspace_id = board_saved_views.workspace_id
    )
  );

create policy "board_saved_views_update_owner_or_admin"
on public.board_saved_views for update
  using (created_by = auth.uid() or public.is_workspace_admin(workspace_id))
  with check (
    (created_by = auth.uid() or public.is_workspace_admin(workspace_id))
    and exists (
      select 1
      from public.boards b
      where b.id = board_id
        and b.workspace_id = board_saved_views.workspace_id
    )
  );

create policy "board_saved_views_delete_owner_or_admin"
on public.board_saved_views for delete
  using (created_by = auth.uid() or public.is_workspace_admin(workspace_id));

