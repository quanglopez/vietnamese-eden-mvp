# ALE-163: Migration Apply Checklist

**Migration file:** `supabase/migrations/20260602190000_board_saved_views.sql`
**Purpose:** Create `public.board_saved_views` table, indexes, unique constraint, `set_updated_at` trigger, and 4 RLS policies for the saved-views feature.
**Apply method:** Supabase Dashboard → SQL Editor (per `docs/kanban-working-agreement.md` §7.6 — Hermes does not auto-apply).
**Risk class:** Medium — creates one new table (no destructive changes), depends on existing helper functions and FK targets from prior migrations.

---

## 0. Pre-flight (do this BEFORE clicking Run)

### 0.1 Confirm the file you will paste
- Path in repo: `C:\Users\ADMIN\vietnamese-eden-mvp\supabase\migrations\20260602190000_board_saved_views.sql`
- Size: 66 lines / ~2.5 KB
- Expected contents: `create table public.board_saved_views (...)` followed by 3 indexes, 1 unique constraint, 1 trigger, 1 `enable row level security`, and 4 policies (select / insert / update / delete).

### 0.2 Confirm the project / branch
- Open the target Supabase project in the dashboard.
- Confirm the URL matches the project's production (or staging) branch. **Do not paste into a sandbox project by accident.**

### 0.3 Pre-apply verification queries (run each in SQL Editor; expect all to pass)

```sql
-- (A) Helper functions must exist (defined in 20260530130000_initial_schema.sql)
select proname, prosecdef
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('is_workspace_member', 'is_workspace_admin', 'set_updated_at')
order by p.proname;
-- Expect 3 rows: is_workspace_admin, is_workspace_member, set_updated_at — all with prosecdef = true

-- (B) FK targets must exist
select 'boards' as t, count(*) from public.boards
union all select 'workspaces', count(*) from public.workspaces
union all select 'profiles', count(*) from public.profiles;
-- Expect 3 rows, all >= 0 (no error = tables present)

-- (C) board_saved_views must NOT exist yet
select to_regclass('public.board_saved_views') as board_saved_views_oid;
-- Expect: board_saved_views_oid = NULL
-- If it returns a regclass, the migration was already applied — STOP and verify.
```

If any of the three checks fail, stop and report to `eden-orchestrator` before applying.

---

## 1. Apply

1. Supabase Dashboard → **SQL Editor** → **New query**.
2. Paste the **entire** contents of `supabase/migrations/20260602190000_board_saved_views.sql` (lines 1–66, no truncation).
3. Click **Run** (or Ctrl/Cmd+Enter).
4. Expected outcome: `Success. No rows returned` (DDL statements only — no INSERT/SELECT in this file).
5. If you see any error: **do not retry blindly.** Copy the error message and stop.

---

## 2. Post-apply verification (run each in SQL Editor; all must pass)

```sql
-- (1) Table created
select to_regclass('public.board_saved_views') as board_saved_views_oid;
-- Expect: a non-null regclass (e.g. "public.board_saved_views")

-- (2) Columns present
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'board_saved_views'
order by ordinal_position;
-- Expect 11 rows: id, board_id, workspace_id, created_by, name, search_query,
-- platform_filters, tag_filters, sort_order, created_at, updated_at
-- platform_filters = ARRAY (text[]), tag_filters = ARRAY (uuid[])

-- (3) Unique constraint
select conname, contype
from pg_constraint
where conrelid = 'public.board_saved_views'::regclass
  and contype in ('u', 'p');
-- Expect 2 rows: board_saved_views_pkey (p) and board_saved_views_board_name_unique (u)

-- (4) Indexes
select indexname from pg_indexes
where schemaname = 'public' and tablename = 'board_saved_views'
order by indexname;
-- Expect: board_saved_views_board_id_idx, board_saved_views_workspace_id_idx,
--         board_saved_views_created_by_idx, plus the implicit ones for PK and unique

-- (5) set_updated_at trigger
select tgname, tgenabled
from pg_trigger
where tgrelid = 'public.board_saved_views'::regclass
  and tgname = 'board_saved_views_set_updated_at';
-- Expect 1 row: tgenabled = 'O' (enabled)

-- (6) RLS enabled
select relname, relrowsecurity, relforcerowsecurity
from pg_class where relname = 'board_saved_views';
-- Expect: relrowsecurity = true, relforcerowsecurity = false

-- (7) Policies (should be exactly 4)
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'board_saved_views'
order by policyname, cmd;
-- Expect:
--   board_saved_views_delete_owner_or_admin | DELETE
--   board_saved_views_insert_member        | INSERT
--   board_saved_views_select_member        | SELECT
--   board_saved_views_update_owner_or_admin| UPDATE
-- All roles = {authenticated}
```

If any of the seven post-apply checks fail, do not run the smoke test. Capture the failing output and report.

---

## 3. Hand off to smoke

After all 7 post-apply checks pass:

- Notify `eden-qa` (or whoever runs the authenticated production smoke) that the migration is live.
- The smoke must cover at minimum:
  1. Create a saved view (INSERT) — expect success for workspace member, 403 for non-member.
  2. List saved views for a board (SELECT) — expect only views in that workspace.
  3. Apply a saved view from the UI (the same code path that already worked in the local smoke).
  4. Delete a saved view you created (DELETE) — expect success.
  5. Delete a saved view another member created (DELETE) — expect success only if you are workspace admin/owner; otherwise 403/empty result.
  6. Duplicate-name INSERT — expect friendly error: "Tên view đã tồn tại trong board này. Hãy chọn tên khác."

---

## 4. Rollback (only if something goes wrong and post-apply checks fail)

```sql
drop policy if exists "board_saved_views_delete_owner_or_admin" on public.board_saved_views;
drop policy if exists "board_saved_views_update_owner_or_admin" on public.board_saved_views;
drop policy if exists "board_saved_views_insert_member"        on public.board_saved_views;
drop policy if exists "board_saved_views_select_member"        on public.board_saved_views;
drop trigger if exists board_saved_views_set_updated_at        on public.board_saved_views;
drop table if exists public.board_saved_views cascade;
```

Rollback is safe because the table has no production rows yet (it was just applied). If any rows were inserted between apply and rollback, expect `drop table` to also drop them (cascade on FKs to `boards`/`workspaces`/`profiles` will not be triggered because the FKs point the other way).

---

## 5. File-location cross-check (for the reviewer reading this in the future)

| Item | Source | Where it lives |
|---|---|---|
| Migration SQL | This task | `supabase/migrations/20260602190000_board_saved_views.sql` |
| Helper functions | ALE-63 | `supabase/migrations/20260530130000_initial_schema.sql` lines 314, 329, 345, 366 |
| `set_updated_at()` | ALE-63 | same file, lines 48–56 |
| `boards` / `workspaces` / `profiles` | ALE-63 | same file |
| RLS helper `is_workspace_member` / `is_workspace_admin` | ALE-63 | same file |
| This checklist | ALE-163 | `docs/database/ale163-migration-apply-checklist.md` |
| PR that merged the migration | ALE-163 | `quanglopez/vietnamese-eden-mvp` PR #12, merge commit `633b2f3` |
| Smoke runbook | ALE-163 | `vercel-production-smoke/references/ale163-local-smoke-runbook.md` |
