# Cursor Prompt — ALE-164: Bulk content actions

> **Audience:** Cursor (primary code implementer).
> **Source:** Linear ALE-164 — "M9 — Bulk content actions".
> **Author:** Hermes orchestrator (pre-flight scope only; do NOT start implementation until user confirms).
> **Branch convention:** `feat/ale-164-bulk-content-actions`.

---

## 0. Context you MUST read first (in this order)

1. **`.cursorrules`** at repo root — TypeScript strict, Server Components default, shadcn/ui, Supabase, Vietnamese UI copy, `npm run lint && npm run type-check && npm run build` must pass.
2. **`docs/kanban-working-agreement.md`** — DoD, migration gate, task naming.
3. **`docs/cursor-prompt-ale-163.md`** *(if it exists)* — pattern reference for previous Cursor prompts.
4. **Existing relevant files (read only, do NOT modify behavior):**
   - `src/components/custom/boards/board-detail-view.tsx` (801 lines) — current board grid + filter + saved views.
   - `src/components/custom/boards/content-item-card.tsx` (215 lines) — single card; has `data-testid="manage-tags-button"`, `Phân tích AI` link to `/breakdown/${id}`.
   - `src/lib/content/tag-actions.ts` — has `assignTagToContent`, `removeTagFromContent`, `createTag`, `deleteTag`, `listTagsForWorkspaceAction`. All return `ActionResult<T>`.
   - `src/lib/boards/queries.ts` — has `listBoardContentItems`, `getBoardById`.
   - `src/lib/content/link-content.ts` — `insertAndLinkContentItem` (single-item insert + link).
   - `src/lib/boards/saved-views-actions.ts` — reference for server-action shape + RLS pattern.
   - `src/types/content.ts` — `BoardContentItem`, `PlatformType`.
   - `src/types/boards.ts` — `BoardDetail`, `BoardListItem`, etc.

**Known gaps that will be your responsibility to fill:**

- ❌ No `deleteContentItemsAction` exists yet → **you must add it.**
- ❌ No `removeContentFromBoardAction` exists → covered by `deleteContentItemsAction` (unlink is the right semantics; do NOT delete the `content_items` row because boards are many-to-many).
- ❌ No `moveContentItemsToBoardAction` exists → **you must add it carefully** (see §6 below).
- ✅ `assignTagToContent` already exists in single form — bulk just calls it in a loop.

---

## 1. Scope

Implement multi-select + bulk actions on the board detail view:

- **Multi-select** content cards via checkbox and shift-click range.
- **Bulk add tag** — apply one tag to N selected items.
- **Bulk delete (unlink from board)** — with explicit confirmation dialog.
- **Bulk move to board** — only if safe (see §6).
- **No regression** on single-card actions, saved views (ALE-163), tag manager (ALE-162), board search/platform/tag filters (ALE-161), content detail (ALE-165).

## 2. Acceptance criteria (Linear)

1. User can select multiple content cards (checkbox + shift-click range).
2. Bulk toolbar appears when at least one card is selected.
3. "Thêm tag" applies a tag to all selected items in one go.
4. "Xóa" prompts confirmation, then unlinks selected items from this board only (content_items rows remain intact if linked elsewhere).
5. "Chuyển board" works if board model + RLS support it; otherwise it must be a documented limitation, NOT a hidden bug.
6. Selection clears after a successful bulk action.
7. Empty selection → bulk action buttons disabled (no silent no-op).
8. Single-card actions still work: tag manager dialog, "Phân tích AI" link, "Quản lý tag" add-tag flow.
9. `npm run lint && npm run type-check && npm run build` all PASS.
10. Smoke checklist completed (see §8).

## 3. Out of scope — do NOT touch

- **AI Breakdown** (`src/components/custom/breakdown/*`, `src/lib/content/analysis-*`).
- **Remix** (`src/components/custom/remix/*`).
- **Voice Profile** (`src/components/custom/voice/*`, `src/lib/voice/*`).
- **Calendar** (`src/components/custom/calendar/*`).
- **Content Detail** (`src/components/custom/content/*` except `content-media-cover` which is a shared primitive).
- **Landing page / marketing** (`src/components/custom/landing/*`).
- **Browser Use scripts** (`scripts/browser-use/*`).
- **Saved Views scope** (ALE-163) — selection state must be ADDITIVE, not a refactor of existing saved-view state.
- **Single-card tag manager behavior** — keep it as-is, only add `onSelectToggle` + `selected` props.
- **URL params** — only add `?selected=id1,id2` if you can do it WITHOUT breaking existing server-component search-param parsing. If unsure, skip URL persistence.

## 4. Architecture rules

- **Server Components by default.** Bulk toolbar + checkboxes can be in the same client component (`BoardDetailView`) because it already is `"use client"`. Do NOT split into a new client component for selection state — keep state local.
- **Server actions live in `src/lib/content/bulk-actions.ts`** (NEW file). Use `"use server"`. Return `ActionResult<...>` matching `src/lib/boards/actions.ts` shape.
- **State:** `selectedIds: Set<string>` in `BoardDetailView`. Do NOT add a global state library.
- **Shift-click range:** compute last-clicked index vs current; if shift held, select the contiguous range. Persist `lastClickedIndex` in a `useRef`.
- **Confirmation dialog:** use existing `Dialog` primitive from `src/components/ui/dialog.tsx`. For bulk delete, require a typed confirmation OR show the count of items about to be deleted.
- **Vietnamese UI copy.** Match existing tone: "Đã xóa N nội dung khỏi bảng.", "Đã thêm tag X cho N nội dung.", "Đã chuyển N nội dung sang bảng Y."

## 5. Implementation contract (file-level)

### 5.1 New file: `src/lib/content/bulk-actions.ts`

```ts
"use server";

export async function bulkAddTagAction(input: {
  contentItemIds: string[];
  tagId: string;
  boardId: string; // for revalidatePath only
}): Promise<ActionResult<{ updated: number }>>;

export async function bulkUnlinkFromBoardAction(input: {
  contentItemIds: string[];
  boardId: string;
}): Promise<ActionResult<{ removed: number }>>;

export async function bulkMoveToBoardAction(input: {
  contentItemIds: string[];
  sourceBoardId: string;
  targetBoardId: string;
}): Promise<ActionResult<{ moved: number }>>;
```

Each must:
- Re-check auth: `supabase.auth.getUser()`; return error if not signed in.
- Trust RLS — do NOT use service role.
- For `bulkAddTagAction`: loop with existing `assignTagToContent` is acceptable OR a single `upsert` with batch rows; both are fine. Count successes, return partial result if any fail.
- For `bulkUnlinkFromBoardAction`: DELETE from `board_content_items` WHERE `board_id = sourceBoardId` AND `content_item_id = ANY(contentItemIds)`. NEVER touch `content_items` row.
- For `bulkMoveToBoardAction`: see §6 — only implement if safe.
- Always `revalidatePath` for the affected board(s).

### 5.2 Modify: `src/components/custom/boards/board-detail-view.tsx`

- Add `const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())`.
- Add `const lastClickedIndexRef = useRef<number | null>(null)`.
- Pass `selected: boolean` and `onSelectToggle: (id: string, mode: 'single' | 'range') => void` down to each `ContentItemCard`.
- Render a sticky bottom toolbar (or top, your call) when `selectedIds.size > 0` with: count display, "Thêm tag" (opens a tag picker dropdown — reuse `workspaceTags`), "Xóa" (opens confirmation), "Chuyển board" (opens board picker — only if §6 passes), "Bỏ chọn" (clears selection).
- Keep existing filter + saved-view state untouched.

### 5.3 Modify: `src/components/custom/boards/content-item-card.tsx`

- Accept new props: `selected: boolean`, `onSelectToggle: (id: string, mode: 'single' | 'range') => void`.
- Render a checkbox in the top-left corner. Use `data-testid="content-select-checkbox"`.
- Click on checkbox: `onSelectToggle(item.id, 'single')` with `event.stopPropagation()`.
- Click on card body while holding Shift: `onSelectToggle(item.id, 'range')` — but BE CAREFUL: card body is wrapped in `<Link href={breakdownHref}>`. Shift-click on link is browser-default range-select on text; you need a custom `onClick` capture that does NOT preventDefault unless shift is held. Otherwise normal click navigates as before.
- Apply visual selected state: `ring-2 ring-brand` + slight background tint.

## 6. Bulk move to board — safety check (READ CAREFULLY)

**Before implementing `bulkMoveToBoardAction`, verify the following. If any check fails, document the limitation and do NOT hack a workaround.**

1. `board_content_items` table has `board_id`, `content_item_id`, `sort_order`, `added_at`, `added_by`. (Read `src/types/database.ts`.)
2. RLS policy on `board_content_items` allows the user to INSERT/DELETE rows in both source and target boards (i.e., user is workspace member of the workspace owning both boards).
3. The `boards` table is queryable to list all boards in the user's workspace (so the picker can populate).

**If all three pass:** implement using a transaction-like pattern (Supabase RPC or sequential insert-then-delete; ROLLBACK delete if insert fails). Reuse `insertAndLinkContentItem` pattern for the new link, then DELETE old link.

**If any check fails:** do NOT implement move. Leave the "Chuyển board" button disabled with a tooltip "Tính năng đang phát triển." and file a follow-up note in `docs/kanban-working-agreement.md` limitations section.

**Hard rule:** do NOT introduce a new migration for this. If a migration is needed, STOP and report to Hermes. The user explicitly said "không tự tạo migration" for this issue.

## 7. Tests / verification you must run before opening PR

```bash
npm run lint
npm run type-check
NODE_OPTIONS=--max-old-space-size=8192 npm run build
```

All three must pass. If any fail, fix and rerun — do NOT open a PR with red CI.

## 8. Smoke checklist you must complete after build passes (locally + production after deploy)

### 8.1 Local against production DB (mirror of ALE-163 pattern)
- [ ] Open board with ≥3 content items.
- [ ] Click 2 checkboxes → bulk toolbar appears with "Đã chọn 2 nội dung".
- [ ] Shift-click a 3rd card → selection extends contiguously (test with non-contiguous to confirm range stops at boundaries).
- [ ] Click "Thêm tag" → pick a tag → confirm 2 items now have the tag. Selection clears.
- [ ] Re-select 2 items → click "Xóa" → confirmation dialog → confirm → 2 items disappear from board. Search for them in another board they belong to (if any) → they still exist there.
- [ ] Re-select items → click "Chuyển board" (if implemented) → pick another board → confirm → items appear in target board, disappear from source. OR confirm button is disabled with explanation if not implemented.
- [ ] Single-card regression: click "Quản lý tag" on one card → tag manager still works. Click "Phân tích AI" → still navigates to `/breakdown/${id}`.
- [ ] Saved views regression: create a saved view, apply it, confirm selection state is independent (does not interfere with active saved view detection).
- [ ] Board search/platform/tag filters regression: change search, confirm filter still works alongside selection.

### 8.2 Production (after merge + Vercel deploy)
- Repeat §8.1 against `https://vietnamese-eden-mvp.vercel.app`.

## 9. PR conventions

- Branch: `feat/ale-164-bulk-content-actions`
- Title: `ALE-164: bulk content actions (multi-select + tag + delete + move)`
- Body: list exact files changed, link to Linear ALE-164, paste smoke checklist completion status.
- **Files in scope (only these + obvious types):**
  - `src/lib/content/bulk-actions.ts` (NEW)
  - `src/components/custom/boards/board-detail-view.tsx` (modify)
  - `src/components/custom/boards/content-item-card.tsx` (modify)
  - Optionally: a new `src/components/custom/boards/bulk-action-toolbar.tsx` (only if you split for clarity; state still owned by `BoardDetailView`).
- **If you need a migration, STOP and ask.** Do not add one.

## 10. Definition of Done (gate before asking for review)

- [ ] All 10 acceptance criteria from §2 met.
- [ ] lint + type-check + build all PASS (§7).
- [ ] Local smoke §8.1 completed.
- [ ] PR opened with title + body per §9.
- [ ] No file from "Out of scope" (§3) modified.
- [ ] No `.env.*` file touched, no secret committed, no `scripts/browser-use/*` modified.
- [ ] If bulk move was skipped, limitation documented in `docs/kanban-working-agreement.md` AND in PR body.

## 11. Report back to Hermes after PR is open

Provide:
- PR URL
- File diff summary (which of §9 files changed)
- Whether bulk move was implemented or skipped (and why)
- Local smoke §8.1 result (PASS/PARTIAL/FAIL with notes)
- lint/type-check/build output
- Any "Out of scope" file you accidentally touched (be honest — Hermes will diff).

Do NOT mark the Linear issue Done. Do NOT merge the PR. Wait for Hermes + the user.
