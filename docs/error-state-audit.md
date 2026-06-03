# Error / Loading / Empty State Audit — ALE-170

**Date:** 2026-06-04
**Scope:** All key app pages after M9 features
**Status:** Audit complete — implementation tickets to be created separately

---

## 1. Reference Pattern (ALE-141)

The `AiLoadingOverlay` + `AiErrorBanner` pattern in `src/components/custom/app/ai-loading-state.tsx` is the gold standard:

- **Loading:** Overlay with progress bar, step counter, elapsed time, cancel button, beforeunload guard
- **Error:** `AiErrorBanner` with message + retry advice (`AI_RETRY_ADVICE`)
- **Timer hook:** `useAiLoadingTimer(isLoading, task)` — returns `message`, `stepText`, `progress`
- **Tasks:** `"breakdown"` | `"remix"` | `"voice"` — each with Vietnamese messages, intervals, max progress

Used by: `breakdown-view.tsx`, `remix-form.tsx`, `voice-profile-form.tsx`

---

## 2. Page-by-Page Findings

### 2.1 Dashboard (`/dashboard`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ❌ MISSING | No `loading.tsx` file |
| Error boundary | ❌ MISSING | No `error.tsx` |
| fetchError | ⚠️ SILENT | Server component fetches data but does NOT pass errors to `DashboardView`. If queries fail, user sees empty dashboard with no error message. |
| Empty state | ✅ GOOD | Onboarding checklist with CTAs (Tạo board, Thêm content, etc.) |

**Fix needed:** Add `loading.tsx`, pass `fetchError` prop to `DashboardView`, add error display.

---

### 2.2 Boards (`/boards`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with PulseBlock skeleton grid |
| Error banner | ✅ GOOD | `fetchError` prop → red banner with message |
| Empty state | ✅ GOOD | "Chưa có bảng nào" with CTA button (Tạo bảng mới) |
| Search empty | ✅ GOOD | "Không tìm thấy bảng phù hợp" |
| Workspace missing | ✅ GOOD | "Chưa có workspace" with Tạo workspace button |
| Retry on error | ❌ MISSING | Error banner shows message but NO retry/reload button |

**Fix needed:** Add retry button to fetchError banner.

---

### 2.3 Board Detail (`/boards/[boardId]`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with PulseBlock skeleton |
| not-found | ✅ GOOD | Custom `not-found.tsx` — "Bảng không khả dụng" with back button |
| Error banner | ✅ GOOD | Board error → AppShell with red banner |
| fetchError | ✅ GOOD | Merged error from items/tags/savedViews/boards |
| Empty state | ✅ GOOD | Items empty with CTA (add content) |
| Filter empty | ✅ GOOD | Platform filter + tag filter + search each have specific empty states |
| Retry on error | ❌ MISSING | No retry button on error banners |

**Fix needed:** Add retry button to fetchError banner.

---

### 2.4 Breakdown (`/breakdown/[contentItemId]`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with Pulse skeleton layout |
| not-found | ⚠️ PROGRAMMATIC | Uses `notFound()` but no custom `not-found.tsx` — falls through to default |
| fetchError | ✅ GOOD | Merged error from item/analysis/outputs/calendar/enrich |
| AI loading | ✅ GOOD | `AiLoadingOverlay` with progress bar (ALE-141 pattern) |
| AI error | ✅ GOOD | `AiErrorBanner` with retry advice |
| Empty (index) | ✅ GOOD | `MvpFeatureHub` with step-by-step instructions |
| Retry on error | ❌ MISSING | fetchError banner has no retry button |

**Fix needed:** Add `not-found.tsx` for `[contentItemId]`, add retry to fetchError banner.

---

### 2.5 Remix (`/remix/[contentItemId]`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with Pulse skeleton |
| not-found | ⚠️ PROGRAMMATIC | Uses `notFound()` but no custom `not-found.tsx` |
| fetchError | ✅ GOOD | Merged error from context/outputs/voiceProfiles |
| AI loading | ✅ GOOD | `AiLoadingOverlay` with progress bar (ALE-141 pattern) |
| AI error | ✅ GOOD | `AiErrorBanner` with retry advice |
| Prereq missing | ✅ GOOD | Amber warning when no raw content / no analysis |
| Empty (index) | ✅ GOOD | `MvpFeatureHub` with instructions |
| Retry on error | ❌ MISSING | fetchError banner has no retry button |

**Fix needed:** Add `not-found.tsx` for `[contentItemId]`, add retry to fetchError banner.

---

### 2.6 Voice (`/voice`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with Pulse skeleton |
| Error banner | ✅ GOOD | `fetchError` prop → red banner |
| Empty state | ✅ GOOD | "Chưa có voice profile" with 3-step instructions |
| AI loading | ✅ GOOD | `AiLoadingOverlay` with progress bar (ALE-141 pattern) |
| AI error | ✅ GOOD | `VoiceErrorMessage` with retry button + isRetrying state |
| Retry on error | ✅ GOOD | `VoiceErrorMessage` has `onRetry` prop |

**No fix needed.** Voice is the best-handled page.

---

### 2.7 Calendar (`/calendar`)

| State | Status | Notes |
|-------|--------|-------|
| Loading skeleton | ✅ GOOD | `loading.tsx` with Pulse skeleton |
| Error banner | ✅ GOOD | `fetchError` prop → red banner |
| Empty state | ✅ GOOD | "Chưa có nội dung" with CTAs (Đi tới Boards, Dashboard) + no-auto-post notice |
| Retry on error | ❌ MISSING | fetchError banner has no retry button |

**Fix needed:** Add retry button to fetchError banner.

---

### 2.8 Auth Pages (`/login`, `/signup`, `/forgot-password`)

| State | Status | Notes |
|-------|--------|-------|
| Login loading | ⚠️ PARTIAL | `Suspense` skeleton exists, but submit has no visible spinner (button just disabled) |
| Login error | ✅ GOOD | `formError` state with specific messages (email not confirmed, etc.) |
| Signup error | ✅ GOOD | `formError` + confirmationSent state |
| Signup success | ✅ GOOD | "Kiểm tra email" confirmation card |
| Forgot password | ✅ GOOD | `formError` + emailSent state |
| Submit spinner | ❌ MISSING | No visual loading indicator during form submit on any auth page |

**Fix needed:** Add loading spinner to submit buttons on auth forms (use `Loader2` icon when `isSubmitting`).

---

### 2.9 Global Error Handling

| State | Status | Notes |
|-------|--------|-------|
| `src/app/error.tsx` | ❌ EMPTY FILE | 0 lines — no global error boundary |
| `src/app/not-found.tsx` | ❌ EMPTY FILE | 0 lines — no global 404 page |
| `src/app/(app)/error.tsx` | ❌ EMPTY FILE | 0 lines — no app-section error boundary |
| `src/app/(app)/not-found.tsx` | ❌ EMPTY FILE | 0 lines — no app-section 404 page |

**Fix needed:** Implement all four files with appropriate UI.

---

## 3. Summary of Gaps

### Critical (user-facing broken experience)
1. **No global error.tsx** — Unhandled runtime errors show Next.js default error page
2. **No global not-found.tsx** — 404s show Next.js default page
3. **Dashboard fetchError silent** — Query failures show empty dashboard with no explanation

### High (inconsistent UX)
4. **fetchError banners lack retry** — boards, board-detail, calendar, remix, breakdown all show error without recovery action (only voice has retry)
5. **No dashboard loading.tsx** — Dashboard has no loading skeleton

### Medium (polish)
6. **Auth form submit spinner** — isSubmitting disables button but no visual feedback
7. **No custom not-found.tsx** for breakdown/[contentItemId] and remix/[contentItemId]
8. **Mobile 375px check** — Needs browser verification (not code-verifiable)

### Already Good
- AI operations (breakdown, remix, voice) all use consistent ALE-141-style loading
- Empty states have clear CTAs on all pages
- Voice error handling is the gold standard (retry + isRetrying)
- Board detail has comprehensive filter/search empty states
- Auth pages have form-level error messages

---

## 4. Recommended Implementation Tickets

| Priority | Ticket | Scope |
|----------|--------|-------|
| P1 | Global error/not-found | Implement `error.tsx` and `not-found.tsx` at app root + (app) route group |
| P1 | Dashboard error handling | Pass fetchError to DashboardView, add loading.tsx |
| P2 | Retry buttons | Add retry button to all fetchError banners (boards, board-detail, breakdown, remix, calendar) |
| P2 | Auth submit spinners | Add Loader2 to submit buttons when isSubmitting |
| P3 | Custom not-found pages | Add not-found.tsx for breakdown/[contentItemId] and remix/[contentItemId] |
| P3 | Mobile 375px audit | Browser-based visual check at 375px width |

---

## 5. Mobile 375px Notes

Cannot verify from code alone. Requires browser testing at production URL with 375px viewport. Key pages to check:
- Dashboard — checklist cards stacking
- Board detail — content cards grid collapse
- Breakdown — two-column layout collapse
- Remix — form + output list stacking
- Voice — two-column layout collapse
- Calendar — weekly view + list stacking
- Auth forms — card width at 375px
