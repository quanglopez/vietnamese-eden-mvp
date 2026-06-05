# Cursor Prompt: ALE-178 — Cohort Activation Analytics

**Issue:** ALE-178
**Project:** M12 — Beta Launch & Activation
**Repo:** quanglopez/vietnamese-eden-mvp
**Date:** 2026-06-05

---

## 1. Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Migration needed? | **No** | JOIN analytics_events ↔ beta_testers via user_id covers all requirements |
| UI location | **Option A — Enhance /admin/analytics** | Analytics page already has funnel + counts + time toggle; cohort section fits naturally |
| New route? | No | Not needed; analytics page already exists at /admin/analytics |
| New server queries? | Yes — 1 new query helper | `getCohortAnalytics()` in new file `src/lib/analytics/cohort-queries.ts` |
| New UI components? | Yes — 1 new section in analytics-dashboard | `CohortSection` inside the existing dashboard |

---

## 2. What We Know (Schema Context)

### analytics_events (63 rows)
```
id, user_id (nullable), workspace_id (nullable), event_type, metadata (jsonb), created_at
```
- event_type enum: signup, login, board_create, content_add, breakdown_run, remix_run, calendar_add
- **workspace_id = null** for signup/login (auth events are platform-wide)
- user_id links to auth.users

### beta_testers (0 rows)
```
id, workspace_id, email, full_name, persona, invite_status, signup_status,
core_flow_status, feedback_status, user_id (nullable), notes, invited_at,
signed_up_at, completed_at, feedback_received_at, created_at, updated_at
```
- persona enum: creator, agency, beauty_lifestyle, educator_coach, other
- user_id is nullable — linker to profiles.id and auth.users.id
- **0 rows currently** — cohort segmentation will show empty state

### How events link to testers (no migration needed)
```
analytics_events.user_id → beta_testers.user_id → persona + invite_status
```
- Testers with user_id set: their analytics events are attributable to persona
- Testers without user_id: their events can't be attributed → show in "Không xác định" bucket
- Auth events (signup/login): workspace_id=null → can't link to workspace-scoped testers unless user_id matches

### Existing funnel (already in /admin/analytics)
- `buildAnalyticsFunnel()` in `src/lib/analytics/queries.ts`
- Uses login as first step, calculates conversion rates vs first step
- Already shows: counts, conversion%, drop-off%, bar chart

---

## 3. What We Build

### Goal
Add a cohort/persona segmentation section to the existing /admin/analytics page, below the funnel chart, that:
1. Shows per-persona event counts
2. Shows persona-filtered funnel
3. Shows owner-friendly interpretation

### Data flow
```
analytics_events (workspace-scoped events: board_create, content_add, etc.)
  LEFT JOIN beta_testers ON analytics_events.user_id = beta_testers.user_id
  WHERE analytics_events.workspace_id = $workspaceId
  GROUP BY beta_testers.persona, analytics_events.event_type
```

### New file: `src/lib/analytics/cohort-queries.ts`

```ts
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { AnalyticsEventType } from "@/types/analytics";
import type { BetaPersona } from "@/types/beta-testers";

export type CohortEventRow = {
  persona: BetaPersona | null;  // null = unattributed
  event_type: AnalyticsEventType;
  count: number;
};

export type CohortAnalysis = {
  rows: CohortEventRow[];
  personas: BetaPersona[];
  totalAttributed: number;
  totalUnattributed: number;
};

/**
 * Get workspace-scoped analytics counts grouped by tester persona.
 * - NULL persona = events from users not linked to any beta tester
 * - Only includes workspace-scoped events (board_create, content_add, etc.)
 * - Auth events (signup/login) excluded because workspace_id=null
 */
export async function getCohortAnalytics(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days = 30,
): Promise<{ rows: CohortEventRow[]; error: string | null }> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data, error } = await supabase
    .from("analytics_events")
    .select(`
      event_type,
      user_id,
      beta_testers!inner(persona)
    `)
    .eq("workspace_id", workspaceId)
    .gte("created_at", since.toISOString());

  // Process into grouped rows...
  // (Cursor to implement the grouping logic)

  return { rows: [], error: null };
}
```

**Important:** The query should use `LEFT JOIN` not `INNER JOIN` so unattributed events are counted. The actual Supabase JS client syntax for joining through foreign keys: `.select("event_type, beta_testers(persona)")` with appropriate filtering.

**Alternative approach (simpler):** Run two queries:
1. Get tester user_ids + personas
2. Get analytics_events for workspace, group by user_id
3. Merge in JS
This avoids Supabase join complexity.

### Extend: `src/types/analytics.ts`

```ts
export type CohortEvent = {
  persona: string;          // BetaPersona or "unattributed"
  eventType: AnalyticsEventType;
  count: number;
};

export type PersonaFunnel = {
  persona: string;
  steps: AnalyticsFunnelStep[];
  confidence: "high" | "medium" | "low";
};
```

### Extend: `src/lib/analytics/queries.ts`

Add a new function `buildPersonaFunnels()` that groups events by persona and runs `buildAnalyticsFunnel()` per persona:

```ts
export function buildPersonaFunnels(
  cohortRows: CohortEventRow[],
  platformAuth: Pick<AnalyticsEventCounts, "login" | "signup">,
): PersonaFunnel[] {
  // Group by persona
  // For each persona, merge with platform auth counts
  // Build funnel per persona
  // Assign confidence: high if >10 events, medium if 3-10, low if <3
}
```

### New UI component: Cohort section in `analytics-dashboard.tsx`

Add below the existing activity chart section:

```
┌─────────────────────────────────────────────┐
│ 🧑👩 Phân tích theo cohort                  │
│ ┌────────┬────────┬──────┬────────┬───────┐ │
│ │ Tất cả │Creator │Agency│Beauty  │Khác   │ │ ← Persona filter pills
│ └────────┴────────┴──────┴────────┴───────┘ │
│                                              │
│ [Persona funnel bars, same style as main]   │
│                                              │
│ ┌─ Owner-friendly interpretation ───────────┐│
│ │ "Người dùng rời bỏ ở bước: ______"       ││
│ │ "Hành động tiếp theo: ______"             ││
│ │ "Độ tin cậy dữ liệu: Thấp/Trung bình/Cao" ││
│ └──────────────────────────────────────────┘│
└─────────────────────────────────────────────┘
```

### New server props in `analytics/page.tsx`

Add to the existing Promise.all:
```ts
const cohortResult = await getCohortAnalytics(supabase, workspace.id, range);
```

Pass `cohortResult` to `AnalyticsDashboard`.

---

## 4. Acceptance Criteria (ALE-178)

- [ ] Admin analytics shows activation funnel (already exists, keep working)
- [ ] **New:** Cohort/persona filter pills above funnel
- [ ] **New:** Per-persona event counts visible
- [ ] **New:** Conversion/drop-off shown per persona (only where data exists)
- [ ] **New:** Owner-friendly interpretation section (drop-off point, next action, confidence)
- [ ] **New:** Empty state when 0 testers: "Chưa có tester nào. Thêm tester tại Quản tester để xem phân tích cohort."
- [ ] **New:** "All time" time window option added (alongside 7d / 30d)
- [ ] Platform-wide auth limitation documented (already exists, keep)
- [ ] Tester-link unreliability documented in UI
- [ ] No data invented — if persona is NULL, show as "Không xác định"
- [ ] Existing /admin/analytics remains functional
- [ ] Existing /admin/beta-launch remains functional
- [ ] No migration
- [ ] No payment/pricing changes
- [ ] npm run lint pass
- [ ] npm run type-check pass
- [ ] npm run build pass

---

## 5. Attribution Limitations (MUST document in UI)

| Limitation | Display text |
|-----------|-------------|
| Auth events platform-wide | "Đăng nhập/đăng ký là chỉ số platform-wide (workspace_id = null). Không thể gán vào workspace cụ thể." |
| Tester-user linking unreliable | "Chỉ tester nào đã liên kết user_id mới có dữ liệu cohort. Tester chưa liên kết sẽ hiển thị trong nhóm 'Không xác định'." |
| 0 testers | "Chưa có tester nào trong workspace này. Thêm tester tại Quản tester để bật phân tích cohort." |
| Small sample | "Cỡ mẫu nhỏ (< 3 events) — độ tin cậy thấp. Cần thêm dữ liệu để kết luận." |
| No source tracking | "Nguồn đăng ký tester không có sẵn (bảng beta_testers chưa có cột source)." |

---

## 6. Files to Change

| File | Action | Scope |
|------|--------|-------|
| `src/lib/analytics/cohort-queries.ts` | **CREATE** | New: `getCohortAnalytics()`, helper types |
| `src/lib/analytics/queries.ts` | **MODIFY** | Add: `buildPersonaFunnels()`, `getAllTimeAnalyticsCounts()` |
| `src/types/analytics.ts` | **MODIFY** | Add: `CohortEvent`, `PersonaFunnel` types |
| `src/components/custom/admin/analytics-dashboard.tsx` | **MODIFY** | Add: cohort filter pills, persona funnel section, interpretation section, "all time" button |
| `src/app/(app)/admin/analytics/page.tsx` | **MODIFY** | Add: `getCohortAnalytics()` call, pass data to dashboard |

**No files to delete.** No sidebar changes. No new routes.

---

## 7. Risks

| Risk | Mitigation |
|------|-----------|
| 0 testers → no cohort data | Show clear empty state; main funnel still works without testers |
| Supabase join complexity | Use server-side JS merge instead of nested select if join is problematic |
| "All time" grows large | analytics_events has only 63 rows now; acceptable for MVP |
| Confidence labels subjective | Use clear thresholds: >10 events = High, 3-10 = Medium, <3 = Low |

---

## 8. Verification Plan

After implementation, verify:

### Build
```bash
npm run lint
npm run type-check
$env:NODE_OPTIONS="--max-old-space-size=8192"; npm run build
```

### Local smoke (browser)
1. /admin/analytics — loads, main funnel still works
2. Cohort section visible with "Chưa có tester nào" empty state
3. /admin/beta-launch — loads, no regression
4. /admin/beta-testers — loads
5. /dashboard — loads
6. /boards — loads
7. 7d / 30d / All time toggle works
8. Console: 0 errors
9. Mobile 375px: no severe overflow

### Guardrails
- [ ] No migration SQL created
- [ ] No pricing/paywall changes
- [ ] No new routes
- [ ] No sidebar changes beyond existing entries
- [ ] NEXT_PUBLIC_PRICING_ENABLED unchanged (false)

---

## 9. Implementation Sequence (for Cursor)

1. **Create `src/lib/analytics/cohort-queries.ts`** with `getCohortAnalytics()` — run two queries, merge in JS
2. **Add types** to `src/types/analytics.ts`
3. **Add `buildPersonaFunnels()`** to `src/lib/analytics/queries.ts`
4. **Update page.tsx** — add cohort data fetch, pass to dashboard
5. **Update dashboard.tsx** — add cohort section UI
6. **Verify** — lint → type-check → build → smoke

---

## 10. Cursor Reminders

- Use `"use client"` for interactive components (filter pills)
- Use `"server-only"` for query files  
- Use existing shadcn/ui components (Card, Button, Badge for persona pills)
- Follow existing Vietnamese copy conventions
- Keep the existing funnel section untouched — add new section below
- The `getCohortAnalytics()` helper should NOT expose user_id, email, or metadata
- When 0 testers exist, show empty state, not an error
- Do NOT add export/CSV — out of scope for this task
