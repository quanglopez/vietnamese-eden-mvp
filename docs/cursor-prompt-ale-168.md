# ALE-168 — Onboarding Checklist Polish — Cursor Prompt

> **For Cursor:** Implement this feature step-by-step. Do NOT modify code outside scope.
> **Goal:** Add first-login onboarding checklist widget to dashboard. Derive progress from existing data, use localStorage for dismiss, no DB migration.

**Linear:** https://linear.app/alexgpt/issue/ALE-168/m10-onboarding-checklist-polish
**Project:** M10 — Beta QA & Activation
**Labels:** p2, UX, Frontend

---

## Architecture

- New client component `OnboardingChecklist` in `src/components/custom/dashboard/`
- Server component `DashboardPage` fetches progress data, passes as props
- Checklist derives progress from existing Supabase tables (no new migration)
- Dismissed state stored in `localStorage` (no DB column needed)
- Vietnamese copy only

## Files to touch

- **Create:** `src/components/custom/dashboard/onboarding-checklist.tsx`
- **Modify:** `src/app/(app)/dashboard/page.tsx` (server component — fetch progress data)
- **Modify:** `src/components/custom/app/dashboard-view.tsx` (render checklist)
- **Modify:** `src/lib/boards/queries.ts` — add helper: `getWorkspaceContentCount(supabase, workspaceId)`
- **Modify:** `src/lib/content/analysis-queries.ts` — add helper: `getWorkspaceAnalysisCount(supabase, workspaceId)`
- **Modify:** `src/lib/content/remix-queries.ts` — add helper: `getWorkspaceRemixCount(supabase, workspaceId)`

## Progress derivation (zero new DB columns)

| Step | Derivation | Check |
|------|-----------|-------|
| Tạo board đầu tiên | `boards.length > 0` (already on dashboard) | `hasBoard: boolean` |
| Thêm content đầu tiên | Count `content_items` in workspace (new query) | `contentCount > 0` |
| Chạy phân tích AI | Count `content_analyses` where status='completed' in workspace | `analysisCount > 0` |
| Thử remix | Count `generated_outputs` in workspace | `remixCount > 0` |
| Thiết lập giọng văn | `voice_profiles.length > 0` (fetch `listVoiceProfilesForUser`) | `hasVoiceProfile: boolean` |

### New query helpers needed

```ts
// src/lib/boards/queries.ts
export async function getWorkspaceContentCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number>

// src/lib/content/analysis-queries.ts
export async function getWorkspaceAnalysisCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number>

// src/lib/content/remix-queries.ts
export async function getWorkspaceRemixCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number>
```

Each helper: `{ count, error } = await supabase.from("table").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId)`. Return `error ? 0 : (count ?? 0)`.

**Pitfall:** `content_analyses` has `status='pending'|'completed'|'failed'` — only count `status='completed'`. `generated_outputs` should count all statuses except maybe `archived` — count `draft|ready|published`.

## Dismissed state: localStorage (NO migration)

```ts
// Key structure
const DISMISSED_KEY = "onboarding_checklist_dismissed";
// Value: "true" or absent

// Read
const dismissed = localStorage.getItem(DISMISSED_KEY) === "true";

// Write on dismiss click
localStorage.setItem(DISMISSED_KEY, "true");
```

**Why localStorage not DB:**
- No `user_settings` table exists
- `profiles` table has no `metadata` JSONB column — adding one = migration
- Dismiss is cosmetic UX; doesn't need cross-device sync
- Checklist only relevant for first-login; localStorage is sufficient
- User explicitly prefers avoiding migration for progress state

**Pitfall:** `localStorage` is browser-only. Guard with `typeof window !== "undefined"` or use `useEffect` + `useState`.

## Checklist component design

```tsx
// src/components/custom/dashboard/onboarding-checklist.tsx
"use client";

type ChecklistStep = {
  id: string;
  label: string;          // Vietnamese
  done: boolean;
  href: string;           // Link to the feature page
};

type OnboardingChecklistProps = {
  steps: ChecklistStep[];
  dismissed: boolean;
  onDismiss: () => void;
};
```

### Steps definition (5 items)

| id | label | href | done derived from |
|----|-------|------|-------------------|
| `board` | Tạo board đầu tiên | `/boards` | `hasBoard` |
| `content` | Thêm content đầu tiên | `/boards` | `contentCount > 0` |
| `breakdown` | Chạy phân tích AI | (link to first board with content) | `analysisCount > 0` |
| `remix` | Thử tạo remix | (link to first content item with analysis) | `remixCount > 0` |
| `voice` | Thiết lập giọng văn | `/voice` | `hasVoiceProfile` |

**Soft links for breakdown/remix**: If no board/content exists, link to `/boards`. If boards exist but no specific item, link to `/boards`. Don't overcomplicate — the checklist is a guide, not a navigation system.

### Visual design

- Card-style widget on dashboard (top area, replacing or alongside the existing "Bắt đầu demo MVP" hero)
- Progress bar at top: "3/5 bước hoàn thành"
- Each step: checkbox (✅ / ⬜) + label + subtle arrow link
- Completed steps: green check, muted text
- Pending steps: subtle emphasis, clickable link
- All-complete state: confetti or celebration message, dismiss button
- Dismiss button (X or "Ẩn") shown when all 5 steps done
- **Mobile 375px responsive**: stack vertically, full-width card

### Vietnamese copy

```
Tiến độ làm quen
{bước} / 5 bước hoàn thành

1. Tạo board đầu tiên
2. Thêm content đầu tiên
3. Chạy phân tích AI
4. Thử tạo remix
5. Thiết lập giọng văn

(When all done):
Tuyệt vời! Bạn đã sẵn sàng sử dụng Vietnamese Eden 🎉
[Ẩn checklist]
```

## Integration into DashboardView

The `DashboardView` component currently has a hero card (`Bắt đầu demo MVP`) and static step cards. Replace or augment:

```tsx
// New props on DashboardView
type DashboardViewProps = {
  title: string;
  subtitle: string;
  boards: BoardListItem[];
  checklist: {
    steps: ChecklistStep[];
    show: boolean; // false if all done AND dismissed, or no workspace
    onDismiss: () => void;
  } | null;
};
```

**If `checklist.show === false`**: Keep existing dashboard UI as-is (current hero + quick links + boards list).

**If `checklist.show === true`**: Render `OnboardingChecklist` widget in place of the current hero card. Keep quick links and boards list below.

## Server component changes (dashboard/page.tsx)

```tsx
// Fetch all progress data in parallel
const [
  { boards },
  { profiles: voiceProfiles },
  contentCount,
  analysisCount,
  remixCount,
] = await Promise.all([
  listBoardsForWorkspace(supabase, workspace.id),
  listVoiceProfilesForUser(supabase, workspace.id, user.id),
  getWorkspaceContentCount(supabase, workspace.id),
  getWorkspaceAnalysisCount(supabase, workspace.id),
  getWorkspaceRemixCount(supabase, workspace.id),
]);

const steps: ChecklistStep[] = [
  { id: "board", label: "Tạo board đầu tiên", href: "/boards", done: boards.length > 0 },
  { id: "content", label: "Thêm content đầu tiên", href: "/boards", done: contentCount > 0 },
  { id: "breakdown", label: "Chạy phân tích AI", href: "/boards", done: analysisCount > 0 },
  { id: "remix", label: "Thử tạo remix", href: "/boards", done: remixCount > 0 },
  { id: "voice", label: "Thiết lập giọng văn", href: "/voice", done: voiceProfiles.length > 0 },
];

const allDone = steps.every(s => s.done);
```

## Scope boundaries

### IN scope
- `OnboardingChecklist` component
- `DashboardView` integration
- Progress derivation queries (3 new helpers)
- `localStorage` dismissed state
- Vietnamese copy
- 375px mobile responsive
- `npm run lint` / `npm run type-check` / `npm run build` pass

### OUT of scope (DO NOT TOUCH)
- **Do NOT create DB migration** — no new tables, no new columns
- **Do NOT modify analytics (ALE-167)** — `analytics_events` table, `trackEvent()`, event types
- **Do NOT log raw content** — no logging of `raw_content`, `title`, `source_url`
- **Do NOT touch Browser Use smoke suite** — `scripts/browser-use/`
- **Do NOT modify AI provider/prompts** — `src/lib/ai/`
- **Do NOT modify auth flow** — `src/components/custom/auth/`
- **Do NOT modify existing hero card** — only wrap/replace conditionally
- **Do NOT modify `app-shell.tsx`** — layout stays the same
- **Do NOT modify sidebar** — `app-sidebar.tsx`
- **Do NOT create new routes/pages**

## Acceptance criteria

- [ ] Checklist widget renders on first visit (no progress)
- [ ] Checklist shows correct completed steps based on existing data
- [ ] Clicking a pending step navigates to the relevant page
- [ ] All-complete state shows celebration + dismiss button
- [ ] Dismiss hides checklist, persists across page refresh (localStorage)
- [ ] Existing users with data see correct progress immediately
- [ ] Users with 0 progress see all steps pending
- [ ] Vietnamese copy on all labels, no English leakage
- [ ] Mobile 375px: no horizontal scroll, readable text, full-width card
- [ ] `npm run lint` — no new warnings/errors
- [ ] `npm run type-check` — no new type errors
- [ ] `npm run build` — production build succeeds
- [ ] No analytics events are lost or broken
- [ ] No raw content in console.log or error messages

## Smoke checklist

1. Fresh user (no data): all 5 steps pending, progress "0/5"
2. Create a board → revisit dashboard → step 1 checked, "1/5"
3. Add content to board → step 2 checked, "2/5"
4. Run breakdown on content → step 3 checked, "3/5"
5. Run remix on content → step 4 checked, "4/5"
6. Create voice profile → step 5 checked, "5/5" → celebration shown
7. Dismiss → widget hidden
8. Refresh page → widget stays hidden (localStorage)
9. Clear localStorage → widget reappears (if progress not 5/5, or all done + re-dismissable)
10. Mobile viewport 375px → all content visible, no overflow

## Risk / regression areas

| Risk | Mitigation |
|------|-----------|
| `getWorkspaceContentCount` slow on large workspaces | Use `count: "exact", head: true` (no data transfer, only count) |
| `getWorkspaceAnalysisCount` only counts completed | Explicit `.eq("status", "completed")` filter |
| localStorage unavailable (SSR, incognito with block) | Guard `typeof window`, fallback to always-show |
| Dashboard page becomes slow with 3 new queries | Run all queries in parallel via `Promise.all` |
| Voice profile page doesn't auto-create | Profile creation is on `/voice` page via server action — checklist correctly links there |
| Analytics events for `breakdown_run` / `remix_run` vs actual DB rows | Derive from DB tables (content_analyses, generated_outputs), NOT analytics_events — more reliable |
| Checklist dismiss on one browser doesn't sync to another | Acceptable — localStorage is per-device by design; not worth a migration |

## Implementation order (for Cursor)

1. Create 3 query helpers (`getWorkspaceContentCount`, `getWorkspaceAnalysisCount`, `getWorkspaceRemixCount`)
2. Verify each helper with lint/type-check
3. Create `onboarding-checklist.tsx` component
4. Update `DashboardView` to accept and render checklist props
5. Update `dashboard/page.tsx` to fetch progress and pass to view
6. Run `npm run type-check && npm run lint`
7. Run `npm run build` (production build)
8. Manual smoke test all 10 cases above
9. Commit

## Commit message

```
feat: add onboarding checklist to dashboard (ALE-168)

- Derive progress from existing boards/content/analysis/remix/voice data
- localStorage dismissed state (no DB migration)
- Vietnamese copy, 375px mobile responsive
- 3 new query helpers: getWorkspaceContentCount, getWorkspaceAnalysisCount, getWorkspaceRemixCount
```
