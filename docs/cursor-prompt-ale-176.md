# Cursor Prompt — ALE-176: Beta Launch Command Center

> **Issue:** ALE-176 — Beta launch command center
> **Project:** M12 — Beta Launch & Activation
> **Planned by:** Hermes (2026-06-05)
> **Status:** READY FOR OWNER REVIEW — do NOT implement yet

---

## Context

You are implementing a **beta launch command center** for Vietnamese Eden MVP. This is a new admin-only page that gives the owner a single-screen view of beta launch readiness — tester counts, cohort breakdown, activation snapshot, and a support checklist.

## Pre-existing Reusable Infrastructure (DO NOT reimplement)

### Auth / Admin guard pattern
Every admin page in this repo uses the same 3-step auth check. DO NOT invent a new pattern — copy the exact pattern from `src/app/(app)/admin/beta-testers/page.tsx` or `src/app/(app)/admin/analytics/page.tsx`:

```ts
const supabase = createClient();
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect("/login");
const { workspace } = await getCurrentWorkspace(supabase, user.id);
if (!workspace) redirect("/dashboard");
const { data: member } = await supabase.from("workspace_members")
  .select("role").eq("workspace_id", workspace.id).eq("user_id", user.id).maybeSingle();
if (!member || (member.role !== "owner" && member.role !== "admin")) redirect("/dashboard");
```

### Existing query helpers (reuse, do not duplicate)
- `src/lib/beta-testers/queries.ts` — `listBetaTestersWithHints()`, `listBetaTesters()`, `getCoreFlowHintsForUsers()`
- `src/lib/analytics/queries.ts` — `getWorkspaceAnalyticsCounts()`, `getPlatformAuthCounts()`, `countAnalyticsEvents()`, `createEmptyAnalyticsCounts()`
- `src/lib/feedback/queries.ts` — `listFeedbackEntries()`, `getFeedbackWeeklySummary()`
- `src/types/beta-testers.ts` — `BetaTesterRow`, `BetaPersona`, `BetaInviteStatus`, `BetaSignupStatus`, `BetaCoreFlowStatus`, `BetaFeedbackStatus`, label helpers, option arrays
- `src/types/analytics.ts` — `ANALYTICS_EVENT_TYPES`, `AnalyticsEventType`
- `src/components/custom/app/app-shell.tsx` — `AppShell` wrapper component

### Supabase tables (read-only for this feature)
- `beta_testers` — columns: id, workspace_id, email, full_name, persona, invite_status, signup_status, core_flow_status, feedback_status, user_id, notes, invited_at, signed_up_at, completed_at, feedback_received_at, created_at, updated_at
- `analytics_events` — columns: id, user_id, workspace_id, event_type, metadata (jsonb), created_at
- `feedback_entries` — columns: id, workspace_id, beta_tester_id, created_by, category, status, priority, ...
- `profiles` — columns: id, email, full_name, avatar_url, created_at, updated_at

### Patterns
- Sidebar nav: `src/components/custom/app/app-sidebar.tsx` — nav array with `{ href, label, icon }` entries
- Page metadata: `export const metadata: Metadata = { title: "..." }`
- Components live under `src/components/custom/admin/`
- Use shadcn/ui components from `src/components/ui/` (Card, Badge, Table, etc.)
- Use lucide-react icons

---

## What to Build

### 1. New lib query helper: `src/lib/beta-launch/queries.ts`

Create a server-only query module that composes existing helpers. No new DB queries — all data comes from existing helpers.

Exports:

```ts
// Computed from beta_testers table (via listBetaTestersWithHints)
export type LaunchOverview = {
  totalTesters: number;
  byInviteStatus: Record<BetaInviteStatus, number>;
  bySignupStatus: Record<BetaSignupStatus, number>;
  byCoreFlowStatus: Record<BetaCoreFlowStatus, number>;
  byFeedbackStatus: Record<BetaFeedbackStatus, number>;
};

// Cohort breakdown
export type CohortBreakdown = {
  byPersona: Record<BetaPersona, number>;
  byStatus: Record<BetaInviteStatus, number>;
  // source breakdown NOT available — beta_testers has no source column. Document limitation.
  sourceNote: string;
};

// Activation snapshot from analytics_events (platform-wide + workspace)
export type ActivationSnapshot = {
  platformAuth: { signup: number; login: number }; // from getPlatformAuthCounts
  workspaceEvents: Record<AnalyticsEventType, number>; // from getWorkspaceAnalyticsCounts
};

// Combined return type
export type BetaLaunchData = {
  overview: LaunchOverview;
  cohort: CohortBreakdown;
  activation: ActivationSnapshot;
  feedbackCount: number; // total feedback_entries count
  testers: BetaTesterWithHint[]; // raw tester rows for the table
  errors: string[];
};
```

Implement a single `getBetaLaunchData(supabase, workspaceId)` function that calls:

1. `listBetaTestersWithHints()` → `overview`, `cohort`, `testers`
2. `getWorkspaceAnalyticsCounts(supabase, workspaceId, 30)` → activation workspace events
3. `getPlatformAuthCounts(30)` → activation auth counts
4. `listFeedbackEntries(supabase, workspaceId)` → feedback count

Compute overview breakdowns by iterating testers array and counting by status.

### 2. New page: `src/app/(app)/admin/beta-launch/page.tsx`

Server component. Follow the exact auth guard pattern above. Call `getBetaLaunchData()`. Render `<AppShell>` with:

```tsx
<AppShell
  title="Beta Launch Command Center"
  subtitle="Tổng quan sẵn sàng ra mắt beta — chỉ owner/admin workspace"
>
  <BetaLaunchDashboard data={data} workspaceName={workspace.name} />
</AppShell>
```

Metadata title: `"Beta Launch · Vietnamese Eden"`

### 3. New component: `src/components/custom/admin/beta-launch-dashboard.tsx`

"use client" component receiving `BetaLaunchData`. Sections from top to bottom:

#### Section A: Launch Overview Cards (grid: 4 cols desktop, 2 cols tablet, 1 col mobile)

Card components using `<Card>` from shadcn/ui. Each card has a title, icon (lucide), and KPI number. Use `bg-gradient-brand-soft` or similar muted background.

1. **Total testers** — icon: `Users` — display `overview.totalTesters`
2. **Invited** — icon: `Send` — display `overview.byInviteStatus.invited + accepted`
3. **Active / testing** — icon: `Activity` — display `overview.byCoreFlowStatus.in_progress + completed + partial`
4. **Completed core flow** — icon: `CheckCircle2` — display `overview.byCoreFlowStatus.completed`
5. **Needs follow-up** — icon: `AlertCircle` — display testers where `invite_status === 'accepted'` AND `core_flow_status === 'not_started'`
6. **Feedback submitted** — icon: `MessageSquare` — display `feedbackCount`

If `feedbackCount` is from `listFeedbackEntries` (all, not just received), use `overview.byFeedbackStatus.received` instead which comes from beta_testers.feedback_status.

Actually, use `feedbackCount` as raw count of feedback_entries rows. That's the simplest link.

#### Section B: Cohort / Persona / Source Breakdown

Two sub-sections side by side on desktop:

1. **By Persona** — a simple bar or horizontal list:
   - creator: N
   - agency: N
   - beauty_lifestyle: N
   - educator_coach: N
   - other: N
   
   Use the `BETA_PERSONA_OPTIONS` from types for labels.

2. **By Status** — similar:
   - pending: N
   - invited: N
   - accepted: N
   - declined: N
   - expired: N

Add a muted note: "Nguồn đăng ký (source) không có sẵn — bảng beta_testers chưa có cột source."

#### Section C: Activation Snapshot

Two sub-sections:

1. **Platform auth** (signup/login) — from `activation.platformAuth`. Show as two numbered badges or small cards.
2. **Workspace activity (30 days)** — from `activation.workspaceEvents`. Show event type counts:
   - board_create: N
   - content_add: N
   - breakdown_run: N
   - remix_run: N
   - calendar_add: N

Use Vietnamese labels matching existing analytics dashboard (Tạo board, Thêm content, Chạy breakdown, Tạo remix, Lên lịch).

Add a note: "Số liệu activation dựa trên analytics_events. Không phải tester nào cũng đã liên kết user_id → workspace. Đây là số tổng workspace, không phải per-tester."

#### Section D: Support Checklist / Launch Ops

A manual checklist rendered as an unordered list with checkboxes (non-interactive, display-only hints). Use lucide `CheckCircle2` / `Circle` icons.

Checklist items (from the acceptance criteria):
- [ ] Gửi invite cho tester
- [ ] Tester đã đăng nhập
- [ ] Tester đã thêm content đầu tiên
- [ ] Tester đã test AI Breakdown
- [ ] Tester đã test Remix
- [ ] Tester đã test Calendar
- [ ] Đã thu thập phản hồi

This is a static rendered list — no interaction, no state. The owner manually checks these off. Add a note: "Checklist thủ công — không tự động. Owner tự đánh dấu khi hoàn thành từng bước."

#### Section E: Error Banner

If `data.errors.length > 0`, render a red banner at the top listing all errors using `<Alert variant="destructive">`.

### 4. Sidebar update: `src/components/custom/app/app-sidebar.tsx`

Add one entry to the `nav` array:

```ts
{ href: "/admin/beta-launch", label: "Beta Launch", icon: Rocket, exact: false as const },
```

Add `Rocket` to the lucide-react import.

Place it between the existing admin entries — after "Phản hồi" (feedback) or before "Thống kê" (analytics). Recommend: after "Phản hồi" as the last admin entry.

---

## Constraints

- **NO migration.** All data comes from existing tables.
- **NO new DB queries** in the query helper — compose only from existing `src/lib/beta-testers/queries.ts`, `src/lib/analytics/queries.ts`, `src/lib/feedback/queries.ts`.
- **NO automated messaging.** The launch checklist is static text.
- **NO Google Sheets / OAuth.**
- **NO AI classification.**
- **NO pricing/paywall changes.**
- **NO payment changes.**
- **Do NOT modify existing admin pages** (beta-testers, analytics, feedback).
- **Do NOT change any existing query helper** — only add new files.
- **Vietnamese labels** for UI text where appropriate (match existing patterns).
- **Mobile responsive** — use Tailwind responsive classes. Cards should stack on mobile.
- **Empty states** — if 0 testers, show "Chưa có tester nào." empty state message, not a broken page.

## Verification (after implementation)

```bash
npm run lint
npm run type-check
npm run build
```

Then manual smoke:
- /admin/beta-launch loads for owner/admin
- /admin/beta-launch redirects non-admin to /dashboard
- /admin/beta-launch redirects unauthenticated to /login
- /admin/beta-testers unaffected
- /admin/analytics unaffected
- /admin/feedback unaffected
- /dashboard unaffected
- /boards unaffected
- No console errors
- No runtime errors
- Mobile 375px: no horizontal overflow

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/lib/beta-launch/queries.ts` | CREATE | Compose existing queries into `getBetaLaunchData()` |
| `src/app/(app)/admin/beta-launch/page.tsx` | CREATE | Server page with auth guard |
| `src/components/custom/admin/beta-launch-dashboard.tsx` | CREATE | Client component: cards, breakdown, activation, checklist |
| `src/components/custom/app/app-sidebar.tsx` | MODIFY | Add "Beta Launch" nav entry with Rocket icon |

## Risks

- **Low risk.** No migration, read-only queries. Only new files + 1 sidebar line change.
- **Empty data:** All 3 tables (beta_testers, analytics_events, feedback_entries) could be empty in production — all counts will show 0. This is expected and must render gracefully.
- **Tester-to-analytics linking:** beta_testers.user_id → analytics_events.user_id is optional (beta_testers.user_id is nullable). The activation snapshot shows workspace-level aggregates, not per-tester. Document this limitation clearly in the UI.

---

## DO NOT

- Merge PR
- Mark PR ready
- Move Linear issue to Done
- Commit without owner confirmation
- Add any migration
- Modify beta_testers schema
- Add source column to beta_testers (out of scope)
