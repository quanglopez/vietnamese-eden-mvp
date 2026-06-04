# Cursor Prompt — ALE-172: Beta Tester Invite + Cohort Tracker

**Issue:** https://linear.app/alexgpt/issue/ALE-172/m11-beta-tester-invite-cohort-tracker
**Branch:** anh555056/ale-172-m11-beta-tester-invite-cohort-tracker
**Status:** In Progress
**Created:** 2026-06-04

---

## Current State (Hermes audit)

### Existing tables

| Table | Purpose | Relevant? |
|-------|---------|-----------|
| `profiles` | id (uuid PK → auth.users), email, full_name, avatar_url | Yes — link beta_testers.email to find signup |
| `workspace_members` | workspace_id, user_id, role (owner/admin/member) | Yes — admin guard uses `is_workspace_admin()` |
| `analytics_events` | event_type enum (signup/login/board_create/content_add/breakdown_run/remix_run/calendar_add), user_id, workspace_id | Yes — core-flow completion lookup |
| `beta_waitlist` | Public landing page signups (email, full_name, use_case, source). RLS: insert-only for anon, no select. | Reference — NOT the same as beta_testers |

### Existing admin pattern (copy this)

Route: `src/app/(app)/admin/analytics/page.tsx`

```
1. getUser() → redirect /login if null
2. getCurrentWorkspace(supabase, user.id) → redirect /dashboard if null
3. supabase.from("workspace_members").select("role").eq(...).maybeSingle()
4. if role not in ('owner', 'admin') → redirect /dashboard
5. Fetch data via server-side queries
6. Render <AppShell> + <ClientComponent data={...} />
```

Component: `src/components/custom/admin/analytics-dashboard.tsx` — client component receiving server-fetched props.

### Existing helpers

- `is_workspace_admin(uuid)` — SQL function, checks workspace_members.role in ('owner', 'admin')
- `createClient()` from `@/lib/supabase/server` — SSR Supabase client
- `createAdminClient()` from `@/lib/supabase/admin` — service role client (bypasses RLS)
- `getCurrentWorkspace()` from `@/lib/workspaces/queries`

### Existing enums (reuse where possible)

```sql
analytics_event_type: 'signup', 'login', 'board_create', 'content_add', 'breakdown_run', 'remix_run', 'calendar_add'
workspace_role: 'owner', 'admin', 'member'
```

---

## Acceptance Criteria

- [ ] Admin UI lists beta testers/cohort entries.
- [ ] Each tester has: email, persona tag, invite status, signup status, core-flow completion status, feedback status.
- [ ] Supports persona tags: Creator, Agency, Beauty/Lifestyle, Educator/Coach, Other.
- [ ] Can manually update status.
- [ ] Links to analytics events where available.
- [ ] Vietnamese copy.
- [ ] No invite email automation unless scoped later.
- [ ] npm run lint/type-check/build pass.

---

## Data Model

### New table: `beta_testers`

```sql
create type public.beta_persona as enum (
  'creator',
  'agency',
  'beauty_lifestyle',
  'educator_coach',
  'other'
);

create type public.beta_invite_status as enum (
  'pending',     -- added to list, not yet invited
  'invited',     -- invite sent
  'accepted',    -- signed up
  'declined',    -- declined invite
  'expired'      -- invite expired (unused for now, future-proof)
);

create type public.beta_signup_status as enum (
  'not_signed_up',
  'signed_up',
  'onboarded'    -- completed profile setup
);

create type public.beta_core_flow_status as enum (
  'not_started',
  'in_progress', -- ≥1 event but not all 4
  'completed',   -- board_create + content_add + breakdown_run + remix_run
  'partial'      -- started but dropped off
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

  -- Identity
  email text not null,
  full_name text,
  persona public.beta_persona not null default 'other',

  -- Status tracking
  invite_status public.beta_invite_status not null default 'pending',
  signup_status public.beta_signup_status not null default 'not_signed_up',
  core_flow_status public.beta_core_flow_status not null default 'not_started',
  feedback_status public.beta_feedback_status not null default 'not_requested',

  -- Link to auth user (set when they sign up)
  user_id uuid references public.profiles (id) on delete set null,

  -- Metadata
  notes text,
  invited_at timestamptz,
  signed_up_at timestamptz,
  completed_at timestamptz,
  feedback_received_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint beta_testers_email_format check (trim(email) ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint beta_testers_workspace_email_unique unique (workspace_id, email)
);

create index beta_testers_workspace_id_idx on public.beta_testers (workspace_id);
create index beta_testers_email_idx on public.beta_testers (lower(trim(email)));
create index beta_testers_user_id_idx on public.beta_testers (user_id);

create trigger beta_testers_set_updated_at
before update on public.beta_testers
for each row execute function public.set_updated_at();

comment on table public.beta_testers is 'Beta tester cohort tracking — admin-managed, no public access';
```

### RLS policies

```sql
alter table public.beta_testers enable row level security;

-- Workspace admins can do everything
create policy "beta_testers_select_admin"
  on public.beta_testers for select to authenticated
  using (public.is_workspace_admin(workspace_id));

create policy "beta_testers_insert_admin"
  on public.beta_testers for insert to authenticated
  with check (public.is_workspace_admin(workspace_id));

create policy "beta_testers_update_admin"
  on public.beta_testers for update to authenticated
  using (public.is_workspace_admin(workspace_id))
  with check (public.is_workspace_admin(workspace_id));

create policy "beta_testers_delete_admin"
  on public.beta_testers for delete to authenticated
  using (public.is_workspace_admin(workspace_id));
```

### Cross-reference with analytics_events

When a beta tester row has `user_id` set (i.e., they signed up), the UI can query `analytics_events` to auto-compute `core_flow_status`:

```sql
-- Check if user has all 4 core events
select event_type, count(*)
from analytics_events
where user_id = :tester_user_id
  and event_type in ('board_create', 'content_add', 'breakdown_run', 'remix_run')
group by event_type;
```

If all 4 present → `completed`. If ≥1 but <4 → `in_progress`. If 0 → `not_started`.

**Important:** This is a display-only enrichment. The `core_flow_status` column in `beta_testers` is the source of truth for manual override. The analytics cross-reference is a convenience hint shown in the UI.

---

## Files to Create/Modify

| File | Action | What |
|------|--------|------|
| `supabase/migrations/20260604_beta_testers.sql` | CREATE | Table + enum + RLS + indexes |
| `src/types/database.ts` | MODIFY | Add beta_testers types to Database interface |
| `src/lib/beta-testers/queries.ts` | CREATE | Server-side queries: list, get, create, update |
| `src/app/(app)/admin/beta-testers/page.tsx` | CREATE | Admin page (copy analytics/page.tsx pattern) |
| `src/components/custom/admin/beta-testers-table.tsx` | CREATE | Client component: table + inline edit |
| `src/components/custom/admin/beta-tester-form.tsx` | CREATE | Add/edit dialog (shadcn Dialog + form) |
| `src/app/(app)/layout.tsx` or AppSidebar | MODIFY | Add "Beta testers" nav item under admin section |

---

## Implementation Details

### 1. Migration (`20260604_beta_testers.sql`)

- Create enums: `beta_persona`, `beta_invite_status`, `beta_signup_status`, `beta_core_flow_status`, `beta_feedback_status`
- Create table `beta_testers` with all columns above
- RLS: admin-only CRUD (copy pattern from `analytics_events` workspace admin policy)
- Index on workspace_id, email, user_id
- `set_updated_at` trigger
- NO foreign key to `beta_waitlist` — different tables, different purposes

### 2. Server queries (`src/lib/beta-testers/queries.ts`)

```typescript
// List all testers for a workspace
async function listBetaTesters(supabase, workspaceId: string): Promise<BetaTester[]>

// Get single tester
async function getBetaTester(supabase, testerId: string): Promise<BetaTester>

// Create tester (admin adds manually)
async function createBetaTester(supabase, workspaceId: string, data: CreateBetaTesterInput): Promise<BetaTester>

// Update tester status
async function updateBetaTester(supabase, testerId: string, data: UpdateBetaTesterInput): Promise<BetaTester>

// Delete tester
async function deleteBetaTester(supabase, testerId: string): Promise<void>

// Cross-reference: get analytics events for a user
async function getTesterAnalyticsEvents(supabase, userId: string): Promise<CoreFlowEventCounts>
```

### 3. Admin page (`src/app/(app)/admin/beta-testers/page.tsx`)

Copy the analytics page pattern:
1. `getUser()` → redirect if null
2. `getCurrentWorkspace()` → redirect if null
3. Role check → redirect if not admin
4. `listBetaTesters(supabase, workspace.id)`
5. For each tester with `user_id`, fetch analytics events (optional enrichment)
6. Render `<AppShell>` + `<BetaTestersTable testers={...} />`

### 4. Client component (`beta-testers-table.tsx`)

shadcn Table with columns:

| Column | Data | Editable? |
|--------|------|-----------|
| Email | `email` | On create only |
| Họ tên | `full_name` | Yes |
| Persona | `persona` enum | Yes (dropdown) |
| Mời | `invite_status` | Yes (dropdown) |
| Đăng ký | `signup_status` | Yes (dropdown) |
| Core flow | `core_flow_status` | Yes (dropdown) + auto-hint from analytics |
| Feedback | `feedback_status` | Yes (dropdown) |
| Ghi chú | `notes` | Yes (textarea) |
| Actions | Edit / Delete | Buttons |

Features:
- "Thêm tester" button opens add dialog
- Inline dropdown edit (click cell → dropdown appears)
- Auto-hint: if tester has `user_id`, show computed core-flow status from analytics as a badge next to the manual dropdown
- Vietnamese labels throughout
- Empty state: "Chưa có tester nào. Nhấn 'Thêm tester' để bắt đầu."

### 5. Sidebar nav

Add to AppSidebar under the existing "Thống kê" admin link:
```
link "Quản tester" [route: /admin/beta-testers]
```

Visibility: show to admin/owner if role is available in sidebar context. If role is not easily available without larger refactor, showing to all authenticated users is acceptable — the page-level guard (role check + redirect) is the real security boundary.

---

## Security Model

| Layer | Protection |
|-------|-----------|
| Route | Server-side role check in page.tsx (same as analytics) |
| RLS | `is_workspace_admin(workspace_id)` on all operations |
| Data isolation | workspace_id FK — testers scoped to workspace |
| No public access | No anon/authenticated policies (admin-only) |
| No secrets in UI | Email + name + status only. No passwords, tokens, or raw analytics metadata. |

---

## Privacy Risks

| Risk | Mitigation |
|------|-----------|
| Tester email visible to all workspace admins | Acceptable — admin-only page, same as workspace_members |
| Linking beta_testers.user_id to analytics_events exposes activity | analytics_events RLS already restricts to workspace admins; no raw content in events |
| beta_waitlist has public insert — could be confused with beta_testers | Different tables, different RLS. No FK. Doc comment clarifies. |
| Notes field could contain sensitive feedback | Admin-only access. No public API. Acceptable for beta. |

---

## Smoke Checklist

| # | Test | Expected |
|---|------|----------|
| 1 | /admin/beta-testers loads (admin user) | Table renders, empty state or existing testers |
| 2 | /admin/beta-testers redirects non-admin | Redirect to /dashboard |
| 3 | Add tester (email + persona) | Row appears in table |
| 4 | Edit tester status (dropdown) | Status updates, timestamp updates |
| 5 | Delete tester | Row removed |
| 6 | Core-flow auto-hint (tester with user_id) | Badge shows computed status from analytics |
| 7 | Vietnamese copy throughout | All labels, buttons, empty states in Vietnamese |
| 8 | /admin/analytics regression | Still loads, no breakage |
| 9 | /dashboard regression | Still loads |
| 10 | Console errors | None |
| 11 | npm run lint | PASS |
| 12 | npm run type-check | PASS |
| 13 | npm run build | PASS |

---

## Migration Review Checklist (for Hermes)

- [ ] Enum types created before table reference
- [ ] FK to workspaces (cascade delete)
- [ ] FK to profiles (set null on delete — tester row survives even if auth user deleted)
- [ ] Unique constraint on (workspace_id, email) — prevent duplicate entries
- [ ] Email format check constraint
- [ ] RLS enabled + 4 policies (select/insert/update/delete admin-only)
- [ ] Indexes on workspace_id, email, user_id
- [ ] set_updated_at trigger
- [ ] No data migration (empty table)
- [ ] Comment on table

---

## Should Cursor Implement?

**YES** — This is straightforward CRUD:
- 1 migration (table + enums + RLS)
- 1 server query file (list/get/create/update/delete)
- 1 admin page (copy analytics pattern)
- 1-2 client components (table + form dialog)
- 1 sidebar nav item addition

All patterns exist in the codebase. Cursor can copy the analytics dashboard pattern and adapt.

**Hermes handles:**
- Migration review (before apply)
- Smoke test (after implementation)
- Docs update (production-smoke-test.md, project-status.md)

---

## Sequence

1. ✅ Hermes: inspect + draft this prompt
2. Cursor: implement (migration + page + components)
3. Hermes: review migration SQL
4. Owner: confirm migration apply
5. Hermes: apply migration via Supabase MCP
6. Hermes: production smoke
7. Hermes: update project-status.md

---

## Decisions (confirmed 2026-06-04)

1. **Persona enum:** ALE-172 AC is source of truth: creator, agency, beauty_lifestyle, educator_coach, other. Do NOT add freelancer/audit_only. Map old feedback-doc personas (Freelancer, Audit-only) to `other` for v1 if needed.
2. **beta_waitlist:** Keep separate for v1. No auto-import. No auto-link. Optional read-only "Có trong waitlist" indicator only if trivial — NOT required, must not expand scope.
3. **Sidebar/admin access:** Owner/admin. Route-level guard mandatory. Sidebar shows "Quản tester" to admins if role is available. If role not available in sidebar without larger refactor, showing link to authenticated users is acceptable as long as page guard redirects non-admin/member to /dashboard.

---

## ~~Open Questions~~ (resolved above)

1. **Persona enum mismatch:** Feedback docs use "Creator, Freelancer, Agency, Audit-only". ALE-172 AC uses "Creator, Agency, Beauty/Lifestyle, Educator/Coach, Other". Confirm the ALE-172 list is correct? (Freelancer and Audit-only dropped; Beauty/Lifestyle and Educator/Coach added.)

2. **beta_waitlist integration:** Should adding a tester auto-check if their email exists in `beta_waitlist`? Or keep them fully separate? (Recommendation: separate for v1, link later if needed.)

3. **Sidebar placement:** Should "Quản lý tester" appear for ALL admin users, or only workspace owner? (Recommendation: all admins, same as "Thống kê".)
