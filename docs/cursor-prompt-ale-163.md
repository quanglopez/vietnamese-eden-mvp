# Cursor Prompt — ALE-163: Saved Board Views

## Linear Issue
- **Key:** ALE-163
- **Title:** M9 — Saved board views
- **State:** Backlog (prepared for In Progress)
- **Previous Done:** ALE-161 (board search + platform filter + empty states), ALE-162 (manual content tags), ALE-165 (content detail page polish)

---

## Goal
Cho phép user **lưu và tái sử dụng** các bộ filter/search trên Board Detail Page. Khi user đã set up search query + platform filters + tag filters theo một logic cụ thể, họ có thể lưu thành một "Saved View" để sau này click-apply ngay lập tức.

---

## Current Repo State

### Board Detail (`src/components/custom/boards/board-detail-view.tsx`)
Current filter state là **local React state** (không lưu URL params):

| State | Type | Current UI |
|---|---|---|
| `searchQuery` + `debouncedQuery` | string | Input text "Tìm theo tiêu đề, nội dung hoặc URL..." |
| `activePlatforms` | `FilterPlatform[]` | Button group toggle: TikTok/Instagram/YouTube/Facebook/LinkedIn/Other |
| `activeTagIds` | `string[]` | Toggle badges của workspace tags |
| Sort | **NOT IMPLEMENTED** | N/A — chưa có sort feature |

### Content Item Card (`src/components/custom/boards/content-item-card.tsx`)
- Hiển thị thumbnail, source quality badge, tags, link đến `/breakdown/[id]`.
- Không liên quan trực tiếp saved views.

### Database
Bảng hiện có (10 bảng base + tags migration):
- `profiles`, `workspaces`, `workspace_members`, `boards`, `content_items`, `board_content_items`, `content_analyses`, `voice_profiles`, `generated_outputs`, `content_calendar_items`, `tags`, `content_item_tags`.
- **Chưa có bảng saved views.**

---

## DB Schema — New Table `board_saved_views`

Create migration: `supabase/migrations/2026060X000000_board_saved_views.sql`

```sql
-- board_saved_views: lưu filter preset của board

create table public.board_saved_views (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  search_query text,
  platform_filters public.platform_type[],   -- nullable: null = tất cả platforms
  tag_filters uuid[],                        -- nullable: null = tất cả tags
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index board_saved_views_board_id_idx on public.board_saved_views(board_id);
create index board_saved_views_workspace_id_idx on public.board_saved_views(workspace_id);

create trigger board_saved_views_set_updated_at
before update on public.board_saved_views
for each row execute function public.set_updated_at();

-- RLS
alter table public.board_saved_views enable row level security;

create policy "board_saved_views_select_workspace_members"
  on public.board_saved_views for select
  using (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = board_saved_views.workspace_id
        and wm.profile_id = auth.uid()
    )
  );

create policy "board_saved_views_insert_workspace_members"
  on public.board_saved_views for insert
  with check (
    exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = board_saved_views.workspace_id
        and wm.profile_id = auth.uid()
    )
  );

create policy "board_saved_views_update_own_or_workspace"
  on public.board_saved_views for update
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = board_saved_views.workspace_id
        and wm.profile_id = auth.uid()
    )
  );

create policy "board_saved_views_delete_own"
  on public.board_saved_views for delete
  using (
    created_by = auth.uid()
    or exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = board_saved_views.workspace_id
        and wm.profile_id = auth.uid()
        and wm.role in ('owner', 'admin')
    )
  );
```

### ⚠️ Migration Rule
- **Tạo file migration trước khi viết code frontend.**
- **Không được mark issue Done cho đến khi migration đã apply lên Supabase Cloud production + smoke pass.**
- Migration file phải nằm trong `supabase/migrations/` với timestamp correct.

---

## Implementation Scope (MVP — Hẹp)

### 1. Supabase Types (`src/types/database.ts`)
Add row type cho `board_saved_views`.

### 2. Queries + Actions (`src/lib/boards/` hoặc `src/lib/content/`) — TBD
- `getSavedViewsForBoard(boardId: string)` → list saved views, sort by `sort_order`.
- `createSavedView(...)` → insert với current filter state.
- `deleteSavedView(id: string)` → soft delete không cần, hard delete OK.
- `updateSavedViewSortOrder(id, sortOrder)` — optional, có thể để sau.

### 3. UI Changes (`src/components/custom/boards/board-detail-view.tsx`)

**A. Save Current View Button**
- Placement: gần search bar hoặc in header bar.
- Icon: `Save` (lucide).
- Click → Dialog nhập tên view.
- Default name: "Xem lọc [Ngày]" hoặc để trống.
- Save: serialize `searchQuery`, `activePlatforms`, `activeTagIds` → DB.

**B. Saved Views Dropdown / List**
- Placement: dưới search bar hoặc cạnh platform filters.
- Dạng: dropdown select hoặc horizontal pill list.
- Item: name của saved view + delete icon (X nhỏ).
- Click item → apply filters (setSearchQuery, setActivePlatforms, setActiveTagIds).
- Highlight item đang active nếu current filters match saved view.

**C. Delete View**
- Each saved view item có dấu X hoặc confirmation popup.
- Only creator hoặc workspace admin/owner có thể delete.

### 4. NO out-of-scope items
- ❌ **No sort** — sort feature chưa tồn tại trong board-detail-view.
- ❌ **No URL query params sync** — keep filter state as local state, không cần URL serialization.
- ❌ **No bulk actions** — ALE-164 là bulk actions.
- ❌ **No global saved views** — scope per-board only.
- ❌ **No share/export** — "Chia sẻ" button đã disabled với title "Sắp ra mắt", không touch.

---

## Acceptance Criteria

| # | Check |
|---|---|
| 1 | User có thể click "Lưu bộ lọc" → nhập tên → saved view được tạo trong DB. |
| 2 | Saved views được list ra trong UI của board. |
| 3 | Click saved view apply ngay lập tức: search query + platform filters + tag filters. |
| 4 | Delete saved view xóa khỏi DB và UI. |
| 5 | RLS: workspace member mới có quyền CRUD saved views của board đó. |
| 6 | Không regression: add content, AI breakdown, remix, voice profile, calendar, source quality badges, manual tags, board filter/search vẫn hoạt động như cũ. |
| 7 | `npm run lint` PASS. |
| 8 | `npm run type-check` PASS. |
| 9 | `npm run build` PASS. |
| 10 | Migration `supabase/migrations/2026060X000000_board_saved_views.sql` đã apply lên Supabase Cloud. |

---

## Test / Smoke Checklist

| # | Test | Expected |
|---|---|---|
| 1 | Đăng nhập → mở board → set filter (search "hook" + platform YouTube + tag "viral") | Filters applied |
| 2 | Click "Lưu bộ lọc" → nhập tên "Viral Hooks" → Save | Saved view xuất hiện trong list |
| 3 | Clear all filters → click saved view "Viral Hooks" | Filters restored: search "hook", YouTube, tag "viral" |
| 4 | Refresh page → saved view vẫn tồn tại | Persisted in DB |
| 5 | Delete saved view "Viral Hooks" | Removed khỏi DB + UI |
| 6 | Member khác trong cùng workspace mở board | Thấy saved view đã tạo |
| 7 | User khác workspace khác mở board | Không thấy saved view |
| 8 | Test board search, platform filter, tag filter | Không regression |

---

## Risk / Regression Areas

| Risk | Mitigation |
|---|---|
| TTFB tăng do fetch saved views | Fetch saved views **song song** với `boardDetail` + `items` trong `page.tsx`. |
| Migration fail (RLS policy syntax) | Test migration local trước, `supabase db push` staging trước production. |
| Platform_type mismatch | Đảm bảo `platform_filters` dùng `public.platform_type[]` (enum đã tồn tại). |
| Tag filter null vs empty array | `null` = tất cả tags; `[]` = không tag nào (nếu cần). Spec: `null` = all. |

---

## Hermes Notes (DO NOT DELETE)

- **DB migration required:** Yes — `board_saved_views` table mới.
- **Migration file path:** `supabase/migrations/2026060X000000_board_saved_views.sql`
- **Next after ALE-163:** ALE-164 (Bulk content actions) — do NOT start ALE-164 trước khi ALE-163 Done + smoke PASS.
- **Cursor scope narrow:** Only saved views feature. No sort, no URL params, no global views, no bulk actions.
- **Hermes agent đã inspect:** board-detail-view.tsx, content-item-card.tsx, queries.ts, tags.ts, database schema (10 tables + tags migration). Không phát hiện blocker ngoài migration requirement.
