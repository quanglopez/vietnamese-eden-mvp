# Cursor Prompt — ALE-162: Manual content tags

**Linear:** [ALE-162](https://linear.app/alexgpt/issue/ALE-162)  
**Branch:** `feat/ale-162-manual-tags`  
**Parent:** ALE-161 (Done — search + platform filter + empty states)  
**Scope:** Tags on content items + board filter. Không saved views, không bulk actions, không AI auto-tag.

---

## Context

### Current State (ALE-161)

- `BoardDetailView` có search input (title, raw_content, source_url) + platform filter toggle group + empty states.
- Content hiển thị qua `ContentItemCard` trong grid 2-3 columns.
- `ContentItemCard` hiện có: thumbnail, author name, source URL, `SourceQualityBadge`, "Phân tích AI" button.
- Data flow Supabase → `board_content_items` join `content_items`.
- No tag subsystem tồn tại — no tables, no types, no logic.

### Stack

- Next.js 15, TypeScript, shadcn/ui, Tailwind CSS, Supabase (`createClient` server/client), PostgreSQL migrations.
- Không ORM — raw SQL + Supabase + Drizzle không dùng.

---

## Acceptance Criteria

### Database
1. Bảng `tags`:
   - `id` uuid PK
   - `workspace_id` uuid FK → workspaces(id) on delete cascade, not null
   - `name` text not null (display name: "Marketing", "Viral", "Draft")
   - `name_normalized` text not null (lowercase + trim + strip diacritics, dùng để dedup)
   - `color` text nullable (hex or shadcn color name, ví dụ: "#FF5733" / "blue" / null → default gray)
   - `created_at` timestamptz default now()
   - `updated_at` timestamptz default now() + trigger `set_updated_at`
   - Unique constraint: `(workspace_id, name_normalized)` — ngăn duplicate tag cùng workspace.

2. Bảng `content_item_tags`:
   - `content_item_id` uuid FK → content_items(id) on delete cascade, not null
   - `tag_id` uuid FK → tags(id) on delete cascade, not null
   - Composite PK: `(content_item_id, tag_id)` — ngăn gắn cùng tag 2 lần

3. Indexes:
   - `tags_workspace_id_idx` on tags(workspace_id)
   - `tags_workspace_normalized_idx` on tags(workspace_id, name_normalized)
   - `content_item_tags_item_idx` on content_item_tags(content_item_id)
   - `content_item_tags_tag_idx` on content_item_tags(tag_id, content_item_id)

4. RLS:
   - `tags`: select/insert/update/delete — workspace member policy (check via workspace_members).
   - `content_item_tags`: select/insert/delete — workspace member policy.
   - Có thể copy logic từ existing RLS policies (content_items, boards, v.v.).

5. Migration file format:
   - `supabase/migrations/20260602000000_content_tags.sql`
   - Format: timestamp prefix + descriptive name.
   - Include seed data optional (do NOT include if workspace-specific).

### Types
6. TypeScript types update:
   - `types/database.ts`: add `tags` + `content_item_tags` row types.
   - `types/content.ts`: `BoardContentItem` thêm `tags: Tag[]`.
   - New type `Tag = { id: string; name: string; color: string | null; }`.
   - New type `TagWithCount = Tag & { contentCount: number }` (bonus for UI hint).

### Queries (Server Actions)
7. `src/lib/boards/queries.ts` (hoặc new `src/lib/content/tag-actions.ts`):
   - `createTag(supabase, workspaceId, name, color?): Promise<Tag | Error>` — normalize name, check dedup before insert.
   - `deleteTag(supabase, tagId): Promise<void>` — only owner or admin?
   - `assignTagToContent(supabase, contentItemId, tagId): Promise<void>` — idempotent (INSERT ON CONFLICT DO NOTHING logic).
   - `removeTagFromContent(supabase, contentItemId, tagId): Promise<void>`.
   - `listTagsForWorkspace(supabase, workspaceId): Promise<Tag[]>` — all tags user can manage.
   - `listTagsForContentItem(supabase, contentItemId): Promise<Tag[]>` — current tags on item.
   - `listBoardContentItems(supabase, boardId)` nâng cấp: join qua `content_item_tags` → trả về `tags` trên mỗi `BoardContentItem`.

### UI — ContentItemCard
8. Tags hiển thị trên card:
   - Vị trí: giữa `SourceQualityBadge` và "Phân tích AI" button, hoặc trên thumbnail overlay.
   - Render: `<Badge variant="outline" style={{backgroundColor: tag.color ?? 'gray'}} className="text-xs">{tag.name}</Badge>`.
   - Nếu >3 tags: show 3 + "+N".
   - Click tag: filter board bằng tag đó (bonus, optional).

### UI — BoardDetailView — Tag Filter
9. Tag filter UI:
   - Vị trí: cùng row với platform filter, bên dưới search input.
   - Render: horizontal row của tag badges (hoặc Popover với tag dropdown).
   - Cho phép multi-select tags (OR logic: có ít nhất 1 trong các tag đã chọn).
   - "Clear all tags" button nếu có tag đang select.
   - Nếu workspace chưa có tag: hiển thị "Chưa có tag" placeholder (không block UI).

### UI — BoardDetailView — Add/Remove Tags
10. Thêm/xóa tag trên content item:
    - CÓ THỂ implement trên card hoặc trên Breakdown page.
    - **Khuyến nghị trên card (popover hoặc inline):**
      - Click "thêm tag" trên card → Popover/Dialog hiện:
        - Existing tags của workspace (click để assign).
        - Input "Tag mới" + Create button.
        - Tag đã gắn → click để remove.
    - Hoặc **đơn giản hơn**: button "Tags" trên card → Dialog quản lý tag cho item.

### UI — BoardDetailView — Combined Filter
11. Search + platform + tag filter **kết hợp đúng**:
    - AND logic: `matchesSearch AND platform_match AND (noTagFilter OR hasAtLeastOneSelectedTag)`.
    - `filteredItems` formula update trong `BoardDetailView`.
    - Derived `filteredItems` từ `useMemo` như hiện tại — chỉ thêm tag filter.

### UI — BoardDetailView — Empty State With Tags
12. Empty state rõ:
    - Nếu tag filter empty + platform filter active:
      ```
      "Không có content {platforms} được gắn tag '{tagNames}'"
      ```
    - Nếu tag filter empty + no other filter:
      ```
      "Không có content nào được gắn tag '{tagNames}'"
      ```
    - Nút "Xóa tag filter" trong empty state.

### Non-regression
13. Không phá:
    - Search (ALE-161) vẫn hoạt động.
    - Platform filter vẫn hoạt động.
    - Add content modal không bị ảnh hưởng.
    - Breakdown link từ card vẫn đúng.
    - Remix, Calendar, Voice Profile không bị ảnh hưởng.
    - SourceQuality badges vẫn render đúng.

---

## Edge Cases

| Case | Expected |
|------|----------|
| Tag name "Marketing" vs "marketing" | Same tag (dedup bằng `name_normalized`) |
| Assign đã có tag | No error (ON CONFLICT DO NOTHING) |
| Delete tag đang gắn content | `content_item_tags` cascade delete (tag_id FK on delete cascade) |
| Remove tag from content | Row deleted từ `content_item_tags` |
| Workspace chưa có tag | Placeholder text, không crash |
| Tag filter on card click | Board filter updates, URL sync optional |
| Nhiều tags trên card overflow | Show max 3 + "+N" badge |
| Tag với color null | Default gray badge |

---

## Technical Implementation Order

### Commit 1: Database Migration
- `.sql` migration: `tags` + `content_item_tags` + indexes + RLS.
- Run migration local: `supabase db push` hoặc `npx supabase db push`.
- Verify migration không break existing data.

### Commit 2: Types + Server Actions
- Update `types/database.ts`, `types/content.ts`, `types/boards.ts`.
- New `src/lib/content/tag-actions.ts` (hoặc `src/lib/boards/tag-actions.ts`):
  - createTag, deleteTag, assignTagToContent, removeTagFromContent, listTagsForWorkspace, listTagsForContentItem.
- Update `src/lib/boards/queries.ts`: `listBoardContentItems` join `content_item_tags` + `tags` → trả `tags[]`.

### Commit 3: Board UI — Tag Filter + Card Display
- `BoardDetailView`: thêm `activeTags` state, tag filter UI row, update `filteredItems`.
- `ContentItemCard`: render tags, "+N" overflow, click-to-filter bonus.
- Empty state update cho tag filter.

### Commit 4: Tag Management Popover/Dialog
- Popover/Dropdown hoặc Dialog cho add/remove tag trên card.
- Form: existing tag list + new tag input + color picker optional.
- Validate empty tag name, normalize before create.
- Server action wiring (useTransition / useOptimistic optional).

---

## Guard Rails

- Chỉ manual tags (không AI auto-tag).
- Không saved views (ALE-163).
- Không bulk actions (ALE-164).
- Không thay đổi RLS policy của existing tables.
- Migration phải rollback-safe (no destructive alter on existing data).
- npm run lint/type-check/build pass trước mỗi commit.

---

## Verification

```bash
npm run lint
npm run type-check
npm run build
```

### Manual Smoke (run sau deploy)

| # | Check | Result |
|---|-------|--------|
| 1 | Add tag "Viral" cho content item | OK |
| 2 | Tag "Viral" hiển thị trên card | OK |
| 3 | Filter board bằng "Viral" — chỉ show item đã gắn | OK |
| 4 | Remove tag "Viral" khỏi item | OK |
| 5 | Combine: search "iphone" + platform YouTube + tag "Review" | OK |
| 6 | Empty state: tag filter "Draft" không có kết quả | OK |
| 7 | Add content modal vẫn hoạt động | OK |
| 8 | Breakdown link vẫn đúng | OK |
| 9 | Source quality badge không regression | OK |
| 10 | Duplicate tag name không tạo được | OK |
| 11 | Tag delete gỡ khỏi tất cả content | OK |

---

## Related

- [ALE-161](https://linear.app/alexgpt/issue/ALE-161) Done — Board search + platform filter
- [ALE-163](https://linear.app/alexgpt/issue/ALE-163) Saved board views (pending)
- [ALE-164](https://linear.app/alexgpt/issue/ALE-164) Bulk content actions (pending)
- [ALE-165](https://linear.app/alexgpt/issue/ALE-165) Content detail page polish (pending)
- `supabase/migrations/20260530130000_initial_schema.sql` — initial schema reference
- `src/components/custom/boards/board-detail-view.tsx` — main UI
- `src/components/custom/boards/content-item-card.tsx` — card UI
- `src/lib/boards/queries.ts` — data queries
- `src/types/content.ts` — BoardContentItem type
- `docs/browser-use-smoke-guide.md` — smoke test runner for post-deploy verification
