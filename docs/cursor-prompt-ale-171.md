# ALE-171: Analytics Dashboard MVP — Cursor Prompt

**Issue:** [ALE-171](https://linear.app/alexgpt/issue/ALE-171/m11-analytics-dashboard-mvp)
**Branch:** `anh555056/ale-171-m11-analytics-dashboard-mvp`
**Milestone:** M11 — Beta Launch Readiness
**Priority:** High (p2)

---

## Goal

Build an admin/workspace-admin-only analytics dashboard at `/admin/analytics` showing cohort activity from the existing `analytics_events` table. Surface activation funnel and usage counts without exposing raw user content.

---

## Acceptance Criteria

- [ ] Admin/workspace-admin-only page at `/admin/analytics`
- [ ] Shows event counts for: login, board_create, content_add, breakdown_run, remix_run, calendar_add
- [ ] Shows simple funnel drop-off: login → board → content → breakdown → remix → calendar
- [ ] Shows activity over time: 7d and 30d toggle
- [ ] No raw user content, titles, AI output, remix body, email, token, or secrets displayed
- [ ] Works with current `analytics_events` table — **no migration**
- [ ] Mobile responsive
- [ ] `npm run lint && npm run type-check && NODE_OPTIONS=--max-old-space-size=8192 npm run build` PASS

---

## Existing Infrastructure (do NOT recreate)

### analytics_events table (production)

```
columns: id (uuid PK), user_id (uuid nullable), workspace_id (uuid nullable),
         event_type (enum), metadata (jsonb), created_at (timestamptz)
```

### Event types (enum `analytics_event_type`)

```typescript
// src/types/analytics.ts
export const ANALYTICS_EVENT_TYPES = [
  "signup", "login", "board_create", "content_add",
  "breakdown_run", "remix_run", "calendar_add",
] as const;

export const AUTH_ANALYTICS_EVENT_TYPES = ["signup", "login"] as const;
// Auth events stored with workspace_id = null (Option A)
```

### RLS policies on analytics_events

```
INSERT: user_id = auth.uid()                    (own rows only)
SELECT: workspace_id IS NOT NULL AND is_workspace_admin(workspace_id)
```

### Existing query helper

```typescript
// src/lib/analytics/queries.ts
export async function getWorkspaceAnalyticsCounts(
  supabase, workspaceId, days = 30
): Promise<{ rows: AnalyticsEventCountRow[]; error: string | null }>
```

This helper counts workspace-scoped events only. **Does NOT include signup/login** (those have `workspace_id = null`).

### Existing tracker (server action)

```typescript
// src/lib/analytics/tracker.ts — "use server"
export async function trackEvent(
  eventType: AnalyticsEventType,
  metadata?: AnalyticsMetadata,
  options?: TrackEventOptions,  // { workspaceId?: string | null }
): Promise<void>
```

Metadata is sanitized at write time — forbidden keys (raw_content, title, email, token, etc.) are stripped.

### Service role client (bypasses RLS)

```typescript
// src/lib/supabase/admin.ts
export function createAdminClient()  // uses SUPABASE_SERVICE_ROLE_KEY
```

### Workspace admin check (SQL function)

```sql
-- is_workspace_admin(p_workspace_id uuid) → boolean
-- Checks workspace_members WHERE role IN ('owner', 'admin')
```

### Workspace helper

```typescript
// src/lib/workspaces/queries.ts
export async function getCurrentWorkspace(supabase, userId)
  → { workspace: { id, name, slug } | null, error: string | null }
```

### App shell pattern

```typescript
// All (app) pages use:
import { AppShell } from "@/components/custom/app/app-shell";
// <AppShell title="..." subtitle="...">{children}</AppShell>
```

### Sidebar nav

```typescript
// src/components/custom/app/app-sidebar.tsx
const nav = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/boards", label: "Bảng cảm hứng", icon: FolderHeart, exact: false },
  { href: "/breakdown", label: "AI Breakdown", icon: Sparkles, exact: false },
  { href: "/voice", label: "Giọng văn", icon: Mic, exact: false },
  { href: "/remix", label: "Remix AI", icon: Wand2, exact: false },
  { href: "/calendar", label: "Lịch 30 ngày", icon: CalendarDays, exact: false },
  { href: "/pricing", label: "Gói cước", icon: Tag, exact: false },
];
```

---

## Critical RLS Limitation — Read This First

**signup and login events have `workspace_id = null`.**

The SELECT RLS policy requires `workspace_id IS NOT NULL AND is_workspace_admin(workspace_id)`.

This means: **workspace admins CANNOT see login/signup events** through the normal Supabase client.

Current production data:
```
login:         34 events  (ALL workspace_id = null)
signup:         0 events  (none visible — also null workspace_id)
board_create:   2 events  (workspace_id set)
content_add:    3 events  (workspace_id set)
breakdown_run:  4 events  (workspace_id set)
remix_run:      2 events  (workspace_id set)
calendar_add:   1 event   (workspace_id set)
```

### Solution: Two-query approach

1. **Workspace-scoped events** (board_create, content_add, breakdown_run, remix_run, calendar_add):
   Use normal Supabase client + existing `getWorkspaceAnalyticsCounts()` or similar.
   RLS handles access control.

2. **Platform-wide auth events** (login, signup):
   Use `createAdminClient()` service role to count ALL auth events across all workspaces.
   Gate access: only show to workspace admins (check `is_workspace_admin` or `workspace_members.role IN ('owner','admin')` in the page server component).

**Do NOT modify the existing RLS policy.** The two-query approach is intentional — auth events are platform-wide metrics, not workspace-scoped.

---

## Implementation Plan

### New files

| File | Type | Purpose |
|------|------|---------|
| `src/app/(app)/admin/analytics/page.tsx` | Server component | Page: auth check, fetch data, pass to view |
| `src/components/custom/admin/analytics-dashboard.tsx` | Client component | Dashboard UI: counts, funnel, activity chart |
| `src/lib/analytics/platform-queries.ts` | Server helper | Platform-wide auth event counts via service role |

### Modified files

| File | Change |
|------|--------|
| `src/components/custom/app/app-sidebar.tsx` | Add "Thống kê" nav item (admin-only, conditional) |
| `src/lib/analytics/queries.ts` | Add time-series helper for 7d/30d activity (optional — may go in platform-queries.ts) |

### Route structure

```
src/app/(app)/admin/analytics/page.tsx  →  /admin/analytics
```

The `(app)` layout group already handles auth (redirect to /login if not authenticated).

---

## Detailed Implementation Guide

### 1. Server component: `src/app/(app)/admin/analytics/page.tsx`

```typescript
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";
import { getWorkspaceAnalyticsCounts } from "@/lib/analytics/queries";
import { getPlatformAuthCounts } from "@/lib/analytics/platform-queries";
import { AnalyticsDashboard } from "@/components/custom/admin/analytics-dashboard";

export const metadata: Metadata = {
  title: "Thống kê · Vietnamese Eden",
};

export default async function AnalyticsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Check workspace admin role
  const { workspace } = await getCurrentWorkspace(supabase, user.id);
  if (!workspace) redirect("/dashboard");

  // Verify admin role via workspace_members
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    redirect("/dashboard");
  }

  // Fetch workspace-scoped counts (7d and 30d)
  const [counts7d, counts30d, authCounts] = await Promise.all([
    getWorkspaceAnalyticsCounts(supabase, workspace.id, 7),
    getWorkspaceAnalyticsCounts(supabase, workspace.id, 30),
    getPlatformAuthCounts(), // service role — platform-wide
  ]);

  return (
    <AppShell title="Thống kê" subtitle={`Workspace: ${workspace.name}`}>
      <AnalyticsDashboard
        workspaceCounts7d={counts7d.rows}
        workspaceCounts30d={counts30d.rows}
        authCounts={authCounts}
        errors={[counts7d.error, counts30d.error, authCounts.error].filter(Boolean)}
      />
    </AppShell>
  );
}
```

### 2. Platform queries: `src/lib/analytics/platform-queries.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalyticsEventType } from "@/types/analytics";

export type PlatformAuthCounts = {
  login: number;
  signup: number;
  error: string | null;
};

/**
 * Platform-wide auth event counts (all workspaces).
 * Uses service role to bypass RLS — auth events have workspace_id = null.
 * Only call from admin-gated server components.
 */
export async function getPlatformAuthCounts(): Promise<PlatformAuthCounts> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("analytics_events")
      .select("event_type")
      .in("event_type", ["signup", "login"]);

    if (error) return { login: 0, signup: 0, error: error.message };

    let login = 0;
    let signup = 0;
    for (const row of data ?? []) {
      if (row.event_type === "login") login++;
      if (row.event_type === "signup") signup++;
    }
    return { login, signup, error: null };
  } catch (e) {
    return { login: 0, signup: 0, error: "Service role unavailable" };
  }
}
```

### 3. Time-series helper (in `src/lib/analytics/platform-queries.ts` or `queries.ts`)

```typescript
export type DailyEventCount = {
  date: string; // YYYY-MM-DD
  count: number;
};

export async function getWorkspaceDailyCounts(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days: number,
): Promise<{ data: Record<AnalyticsEventType, DailyEventCount[]>; error: string | null }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since.toISOString());

  if (error) return { data: {} as Record<AnalyticsEventType, DailyEventCount[]>, error: error.message };

  // Group by event_type + date
  const grouped: Record<string, Map<string, number>> = {};
  for (const row of data ?? []) {
    const date = row.created_at.slice(0, 10); // YYYY-MM-DD
    if (!grouped[row.event_type]) grouped[row.event_type] = new Map();
    const map = grouped[row.event_type];
    map.set(date, (map.get(date) ?? 0) + 1);
  }

  // Convert to arrays
  const result: Record<string, DailyEventCount[]> = {};
  for (const [eventType, map] of Object.entries(grouped)) {
    result[eventType] = Array.from(map.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  return { data: result as Record<AnalyticsEventType, DailyEventCount[]>, error: null };
}
```

### 4. Client component: `src/components/custom/admin/analytics-dashboard.tsx`

Key design decisions:
- **No external chart library.** Use simple CSS bar charts + numbers. Keep bundle small.
- **Mobile responsive:** stack cards vertically on small screens, 2-col on md, 3-col on lg.
- **7d/30d toggle:** simple button group at top.
- **Funnel:** horizontal bar chart showing drop-off from login → board → content → breakdown → remix → calendar. Each bar proportional to the max. Show count + % of login.
- **Activity over time:** simple bar chart per day (CSS grid, not canvas/SVG).

Props:
```typescript
type AnalyticsDashboardProps = {
  workspaceCounts7d: AnalyticsEventCountRow[];
  workspaceCounts30d: AnalyticsEventCountRow[];
  authCounts: PlatformAuthCounts;
  errors: (string | null)[];
};
```

UI sections:
1. **Header:** "Thống kê hoạt động" + 7d/30d toggle
2. **Summary cards:** 6 cards showing count per event type (login, board_create, content_add, breakdown_run, remix_run, calendar_add)
3. **Funnel:** Horizontal bars showing drop-off. Label each step in Vietnamese.
4. **Activity chart:** Daily counts for selected period (7d or 30d). Simple CSS bars.

Vietnamese labels:
```
login         → "Đăng nhập"
board_create  → "Tạo bảng"
content_add   → "Thêm nội dung"
breakdown_run → "Phân tích AI"
remix_run     → "Remix"
calendar_add  → "Lịch nội dung"
```

### 5. Sidebar modification

In `src/components/custom/app/app-sidebar.tsx`, add an admin-only nav item:

```typescript
// After the existing nav array, conditionally add admin link:
// Import BarChart3 from lucide-react
// Add to nav (conditionally based on user role — requires passing role info)

// Option A: Always show, page-level guard redirects non-admins
// Option B: Hide from sidebar for non-admins (requires passing role to client)
// Recommendation: Option A for simplicity — the page already guards access.
// Add to nav array:
{ href: "/admin/analytics", label: "Thống kê", icon: BarChart3, exact: true },
```

**Important:** If you want to hide the sidebar item for non-admins, you'll need to pass the user's workspace role through `AppSessionProvider`. For MVP, Option A (always show, page-level guard) is simpler and acceptable.

---

## Privacy & Security Rules

1. **No raw content displayed.** Only counts, event_type labels, and dates.
2. **No metadata values shown.** The `metadata` JSONB column is never rendered in the dashboard.
3. **No email/user_id shown.** Dashboard shows aggregate counts only.
4. **Admin-only access.** Server component checks `workspace_members.role IN ('owner', 'admin')` before rendering.
5. **Service role usage:** Only for counting platform-wide auth events (login/signup). Never returns raw user data.
6. **No new RLS policies.** Existing policies are correct and sufficient.

---

## What NOT to Do

- ❌ No migration. The existing table and RLS are sufficient.
- ❌ No new SQL functions or views.
- ❌ No external chart libraries (recharts, chart.js, etc.). Use CSS-only bars.
- ❌ No raw metadata, content, titles, emails, or tokens in the UI.
- ❌ No `analytics_events` RLS policy changes.
- ❌ No changes to `tracker.ts` or existing event tracking.
- ❌ No changes to `(app)/layout.tsx`.

---

## File Scope (exact)

### New files (3)

1. `src/app/(app)/admin/analytics/page.tsx`
2. `src/components/custom/admin/analytics-dashboard.tsx`
3. `src/lib/analytics/platform-queries.ts`

### Modified files (1-2)

4. `src/components/custom/app/app-sidebar.tsx` — add admin nav item
5. `src/lib/analytics/queries.ts` — optional: add daily counts helper (or put in platform-queries.ts)

**Total: 4-5 files.** Respect this scope. No unrelated changes.

---

## Verification

```bash
npm run lint
npm run type-check
NODE_OPTIONS=--max-old-space-size=8192 npm run build
```

All three must pass before PR.

---

## Smoke Checklist (for Hermes after PR)

1. Login as workspace admin → `/admin/analytics` loads
2. Login as non-admin/member → redirected to `/dashboard`
3. Event counts match production data (login: 34, board_create: 2, etc.)
4. 7d/30d toggle works
5. Funnel shows drop-off percentages
6. Mobile responsive (375px viewport)
7. No raw content/email/token visible in page source
8. `/api/health` still works
9. Existing pages (dashboard, boards, breakdown) not broken
10. `npm run lint/type-check/build` PASS

---

## Current Production Data (for reference)

```
login:         34 events  (2026-06-03 → 2026-06-04)
board_create:   2 events  (2026-06-03)
content_add:    3 events  (2026-06-03)
breakdown_run:  4 events  (2026-06-03 → 2026-06-04)
remix_run:      2 events  (2026-06-03)
calendar_add:   1 event   (2026-06-03)
```
