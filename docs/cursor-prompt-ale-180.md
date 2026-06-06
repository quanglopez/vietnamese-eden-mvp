# Cursor Prompt — ALE-180: First-run Activation Improvements

## Context
- **Project:** Vietnamese Eden MVP (Next.js 14 App Router + Supabase)
- **Repo:** C:\Users\ADMIN\vietnamese-eden-mvp
- **Production:** https://vietnamese-eden-mvp.vercel.app
- **Milestone:** M12 — Beta Launch & Activation (IN PROGRESS)
- **Previous issues:** ALE-168 (onboarding checklist), ALE-176 (beta launch dashboard), ALE-177 (onboarding docs), ALE-178 (cohort analytics), ALE-179 (feedback-to-Linear candidate generator)
- **This issue:** ALE-180 — First-run activation improvements

## Problem Statement
New beta testers land on `/dashboard` with an onboarding checklist (ALE-168), but the checklist is static — it doesn't adapt to their actual progress. Users don't know the **single next best action** based on what they've already done. Empty states across the product are helpful but could be more actionable. There's no sample content helper for testers who don't have their own viral content ready.

## Current State Analysis

### Dashboard (`/dashboard` + `OnboardingChecklist`)
- **File:** `src/app/(app)/dashboard/page.tsx` + `src/components/custom/dashboard/onboarding-checklist.tsx`
- **Current steps (5):** Board → Content → Breakdown → Remix → Voice Profile
- **Data sources:** `listBoardsForWorkspace`, `getWorkspaceContentCount`, `getWorkspaceAnalysisCount`, `getWorkspaceRemixCount`, `listVoiceProfilesForUser`
- **Limitation:** Static checklist — all steps shown regardless of relevance. No "next best action" card.

### Boards (`/boards` + `/boards/[boardId]`)
- **Files:** `src/components/custom/boards/boards-list-view.tsx` (empty state lines 138-154)
- **Board detail empty content state:** `src/components/custom/boards/board-detail-view.tsx` (lines 798-813)
- **Good:** Clear CTA buttons, Vietnamese copy, gradient icon
- **Gap:** No sample content helper link

### AI Breakdown (`/breakdown` + `/breakdown/[id]`)
- **Index:** `MvpFeatureHub` with steps — decent but generic
- **Detail:** `BreakdownView` shows "Bấm 'Phân tích AI'" when no analysis exists (line 256-258)
- **Gap:** No sample content suggestion for empty breakdown

### Remix (`/remix` + `/remix/[id]`)
- **Index:** `MvpFeatureHub` with steps
- **Detail:** `RemixView` shows amber alert when no raw content/analysis (lines 69-78)
- **Gap:** No path back to sample content

### Voice Profile (`/voice`)
- **File:** `src/components/custom/voice/voice-view.tsx` (lines 80-103)
- **Good:** Clear 3-step instruction, CTA to form
- **Gap:** No sample content suggestion

### Calendar (`/calendar`)
- **File:** `src/components/custom/calendar/calendar-view.tsx` (lines 47-66)
- **Good:** Clear CTA to Boards + Dashboard
- **Gap:** No sample content suggestion

### Add Content Modal
- **File:** `src/components/custom/boards/add-content-modal.tsx`
- **Tabs:** "Dán link" + "Paste text"
- **Gap:** No sample text button/placeholder

## Recommended Implementation (Small Scope, No Migration)

### 1. Dashboard: "Next Best Action" Card
**Files:** `src/app/(app)/dashboard/page.tsx`, `src/components/custom/dashboard/onboarding-checklist.tsx` (or new component)

- Add a prominent single card above the checklist showing **exactly one next step** based on current state:
  - No board → "Tạo board đầu tiên" → `/boards` (CTA)
  - Has board, no content → "Dán bài content đầu tiên" → `/boards` (CTA opens AddContentModal)
  - Has content, no breakdown → "Chạy AI Breakdown" → first board's first content item breakdown page
  - Has breakdown, no remix → "Tạo remix đầu tiên" → breakdown page "Tạo remix" button
  - Has remix, no calendar → "Đưa output vào Calendar" → breakdown page "Add to Calendar"
  - Has calendar item → "Gửi feedback beta" → link to feedback form / docs
- Deterministic logic, no AI, queries already available in dashboard page
- Show only when checklist not 100% complete or dismissed

### 2. Empty State Improvements (2-3 critical ones)
**Files:**
- `src/components/custom/boards/board-detail-view.tsx` (empty content state)
- `src/components/custom/boards/add-content-modal.tsx` (add sample text helper)
- `src/components/custom/breakdown/breakdown-view.tsx` (no analysis state)

**Changes:**
- **Board detail empty state:** Add "Thử nội dung mẫu" button/link next to "Thêm content"
- **Add Content Modal (Paste text tab):** Add "Nội dung mẫu Việt Nam" button that pre-fills title + rawContent with a realistic Vietnamese viral caption
- **Breakdown no-analysis state:** Add link to sample content or "Thử ngay với nội dung mẫu"

### 3. Sample Content Helper
**File:** New constant file `src/lib/content/sample-content.ts` (or inline)

- Export 2-3 realistic Vietnamese viral content samples (skincare, finance, lifestyle niches)
- Each sample: `{ title: string, rawContent: string, platform?: string, sourceUrl?: string }`
- Used by AddContentModal "Nội dung mẫu" button
- No external API, no migration, pure client-side

### 4. Dashboard Checklist Enhancement
- Keep existing checklist but add subtle visual indicator for "current focus" step
- Optionally: collapse completed steps by default when not all done

## Acceptance Criteria
- [ ] New user sees a clear "Next best action" card on dashboard
- [ ] Empty board/content states explain what to do in Vietnamese + CTA
- [ ] User can access a sample content prompt/text via "Nội dung mẫu" button
- [ ] Existing dashboard remains functional
- [ ] Existing board/content/breakdown/remix/calendar flows remain functional
- [ ] No migration required
- [ ] No pricing/paywall/payment changes
- [ ] No automated messaging
- [ ] No AI classification
- [ ] Mobile 375px has no severe overflow
- [ ] `npm run lint` / `npm run type-check` / `npm run build` pass

## Files Likely to Change
1. `src/app/(app)/dashboard/page.tsx` — compute next best action
2. `src/components/custom/dashboard/onboarding-checklist.tsx` — add next-action card or new component
3. `src/components/custom/boards/board-detail-view.tsx` — enhance empty content state
4. `src/components/custom/boards/add-content-modal.tsx` — add sample content button in Paste text tab
5. `src/components/custom/breakdown/breakdown-view.tsx` — enhance no-analysis state
6. `src/lib/content/sample-content.ts` — new file with sample content constants
7. Possibly: `src/components/custom/voice/voice-view.tsx`, `src/components/custom/calendar/calendar-view.tsx` — minor CTA additions

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing checklist logic | Low | Medium | Unit test checklist progress logic |
| Sample content not realistic enough | Medium | Low | Use real Vietnamese viral patterns from cohort feedback |
| Mobile overflow on new card | Low | Medium | Test 375px, keep card compact |
| Migration accidentally needed | Very Low | High | Verify no schema changes — all data from existing queries |

## Migration Needed: No
All data comes from existing Supabase queries. No schema changes.

## Verification Plan
1. `npm run lint`
2. `npm run type-check`
3. `$env:NODE_OPTIONS="--max-old-space-size=8192"; npm run build`
4. Local smoke:
   - `/dashboard` loads for new/empty state → next-action card visible
   - `/boards` loads → empty state + CTA works
   - `/boards/[id]` empty content → sample content button works
   - Add content flow → "Nội dung mẫu" pre-fills form
   - `/breakdown/[id]` no analysis → CTA to sample content works
   - `/voice` empty → existing flow works
   - `/calendar` empty → existing flow works
   - Admin pages unaffected: `/admin/beta-launch`, `/admin/analytics`, `/admin/feedback`
   - No console errors
   - Mobile 375px no severe overflow

## Out of Scope (Do Not Implement)
- Automated messaging / notifications
- Google Sheets / OAuth integration
- AI classification of user progress
- Pricing / paywall / payment changes
- Broad refactor of onboarding checklist
- Migration / schema changes
- Multi-step wizard / tour

## Implementation Order
1. Create `src/lib/content/sample-content.ts` with 2-3 samples
2. Add "Nội dung mẫu" button to AddContentModal (Paste text tab)
3. Enhance board-detail empty state with sample content link
4. Enhance breakdown no-analysis state with sample content link
5. Add "Next best action" card to dashboard (compute logic in page.tsx, render in checklist or new component)
6. Test all acceptance criteria
7. Run lint/type-check/build
