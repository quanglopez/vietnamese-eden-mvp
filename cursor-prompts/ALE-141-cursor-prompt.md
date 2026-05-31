# Cursor Prompt — ALE-141: Improve AI Long-Running Loading State

## Issue
**Linear:** [ALE-141](https://linear.app/alexgpt/issue/ALE-141/ale-90a-improve-ai-long-running-loading-state)  
**Priority:** P1 (origin P0 blocker from beta feedback)  
**Beta Evidence:** 4/5 beta reports mention AI latency 30-120s with no clear progress indication. test.eden.vn lost data by refreshing because they thought the app froze.

---

## Problem Statement

Beta users report that when AI runs tasks (Breakdown, Remix, Voice Profile), the UI shows only a small spinner + 1 line of text for potentially 30-120 seconds. Users:
1. Cannot tell if the app is still working or frozen
2. Don't know how long the wait will be
3. Refresh the page (losing unsaved work) thinking it's stuck
4. Have no way to cancel or retry

Current loading indicators:
- `breakdown-view.tsx`: `<Loader2 className="animate-spin" />` + "Đang phân tích bằng AI…"
- `remix-form.tsx`: `<Loader2 className="animate-spin" />` + "Đang tạo remix…"
- `voice-profile-form.tsx`: `<Loader2 className="animate-spin" />` + "Đang phân tích giọng viết…"

These are minimal and identical across all 3 features — no differentiation, no progress, no reassurance.

---

## Goal

Create a **reusable, consistent AI loading experience** for Breakdown, Remix, and Voice Profile that:
1. **Reassures users** the app is actively processing
2. **Gives a sense of progress** (even if fake/estimated)
3. **Prevents data loss** on refresh/error via state preservation
4. **Speaks Vietnamese** in a friendly, human tone
5. **Works within existing `useTransition` / Server Action** patterns

---

## Files to Modify

### Create new:
- `src/components/custom/app/ai-loading-state.tsx` — reusable overlay component
- `src/lib/content/loading-messages.ts` — rotating Vietnamese message utilities

### Modify:
- `src/components/custom/breakdown/breakdown-view.tsx`
- `src/components/custom/remix/remix-form.tsx`
- `src/components/custom/voice/voice-profile-form.tsx`
- `src/components/custom/breakdown/breakdown-sections.tsx` — wrap submit with new loading state

---

## Acceptance Criteria

### AC1: Reusable `AiLoadingOverlay` component
- Create `ai-loading-state.tsx` with props:
  - `isLoading: boolean`
  - `title: string` (e.g., "AI đang phân tích")
  - `subtitle: string` (estimated time, e.g., "Có thể mất 30–90 giây")
  - `stepText?: string` (current step, e.g., "Bước 2/3: Phân tích hook")
  - `progress?: number` (0-100 optional)
  - `onCancel?: () => void`
- Uses `shadcn/ui` components where possible (`Card`, `Progress`, `Button`)
- Visual: semi-transparent overlay on the content with centered card, **not** blocking the entire screen (so browser stays responsive)
- Show cancel button only if `onCancel` is provided (we may skip cancel for now)

### AC2: Rotating Vietnamese messages
Create utility `getLoadingMessage(task: 'breakdown' | 'remix' | 'voice', elapsedSeconds: number)` that cycles messages:

**Breakdown messages** (cycle every 10s):
1. "AI đang phân tích nội dung…" (0-10s)
2. "Đang nhận diện hook, angle và CTA…" (10-20s)
3. "Đánh giá thương hiệu và cảm xúc…" (20-30s)
4. "Gần xong rồi, đang tổng hợp…" (30s+)

**Remix messages** (cycle every 10s):
1. "Đang tạo các biến thể từ nội dung gốc…"
2. "Đang viết lại theo angle khác nhau…"
3. "Đang kiểm tra độ đa dạng…"
4. "Gần xong rồi, đang hoàn thiện từng bản…"

**Voice Profile messages** (cycle every 12s):
1. "AI đang đọc các bài viết mẫu…"
2. "Đang phân tích từ vựng và cấu trúc câu…"
3. "Đang nhận diện tone và quy tắc viết…"
4. "Đang tổng hợp giọng văn, có thể mất thêm chút…"

Default fallback if unknown task: "AI đang xử lý… Có thể mất 30–90 giây. Vui lòng không đóng trang."

### AC3: Integration into Breakdown
In `breakdown-view.tsx`, replace current simple spinner (lines 124-128) with `AiLoadingOverlay`:
- Title: "AI Breakdown"
- Subtitle: "Có thể mất 30–90 giây · Có thể lâu hơn với nội dung dài"
- Show rotating messages based on elapsed time since `isPending` became true
- Use `useEffect` + `setInterval` to update message every 10s during pending
- Keep existing `<BreakdownStatusBanner>` visible but dimmed underneath
- Still show `formError` if API returns error

### AC4: Integration into Remix
In `remix-form.tsx`, replace simple spinner (lines 189-193) with `AiLoadingOverlay`:
- Title: "Đang tạo remix"
- Subtitle: `Đang tạo {variantCount} biến thể, có thể mất 30–120 giây`
- Rotating remix messages
- Disable entire form visually while loading (make opacity 50%, add overlay)
- Keep `error` display if server returns error

### AC5: Integration into Voice Profile
In `voice-profile-form.tsx`, replace simple spinner (lines 129-132) with `AiLoadingOverlay`:
- Title: "Đang phân tích giọng văn"
- Subtitle: "Có thể mất 60–120 giây với nhiều bài viết mẫu"
- Rotating voice messages
- Disable form visually during loading
- **Preserve input:** If API fails, the form fields should NOT be cleared (they currently ARE cleared on success only, but check: `setName("")` etc runs after success; keep them on failure)

### AC6: State preservation on error
In all three components:
- When `useTransition` resolves, check `result.success`
- If NOT success, do NOT clear form fields (voice-profile-form should NOT reset name/description/sampleWritings on error)
- Show clear error banner with action advice:
  - "Không thể phân tích. Có thể do mạng chậm hoặc server bận. Hãy thử lại."

### AC7: Build & type safety
- `npm run lint` pass
- `npm run type-check` pass
- `npm run build` pass (or `NODE_OPTIONS=--max-old-space-size=8192 npm run build` if OOM)
- No TypeScript `any` in new code

---

## Design Guidelines

- Use existing Tailwind classes + shadcn tokens (`bg-background`, `text-foreground`, `border-border`, `text-muted-foreground`, `text-brand`, `text-destructive`)
- Do NOT introduce new design tokens
- Do NOT change colors outside the existing palette
- Keep Vietnamese copy warm and personal (not robotic)
- The overlay should feel like part of the app, not a 3rd-party widget

---

## Constraints

- ❌ Do NOT change AI provider (MiMo V2.5) logic
- ❌ Do NOT change database schema
- ❌ Do NOT change existing API endpoints
- ❌ Do NOT change `useTransition` / Server Action patterns
- ❌ Do NOT add external dependencies (no `@radix-ui/react-progress` if not already installed — use existing `<Progress>` from shadcn/ui)
- ❌ Do NOT block the entire browser tab (user should still scroll, switch tabs)
- ✅ You MAY add new React components and utility files
- ✅ You MAY add CSS animations in Tailwind
- ✅ You MAY use existing shadcn/ui components (`Progress`, `Card`, `Skeleton`)

---

## Testing Checklist

After implementation, verify all 3 features:
- [ ] Click "Phân tích AI" → see overlay with rotating messages, not just spinner
- [ ] Click "Tạo remix" → see overlay with variant count and rotating messages
- [ ] Click "Phân tích & lưu profile" → see overlay with voice-specific messages
- [ ] Wait 10s+ → message changes to next step
- [ ] If API errors → overlay disappears, error shown, form fields preserved
- [ ] Refresh page during loading → browser refreshes (this is expected; we cannot prevent it, but we should prevent accidental navigation away — add `beforeunload` warning if `isPending`)
- [ ] Build passes
- [ ] No TS errors

---

## Copy Reference (Vietnamese)

```typescript
// Add to loading-messages.ts

export const BREAKDOWN_MESSAGES = [
  "AI đang phân tích nội dung…",
  "Đang nhận diện hook, angle và CTA…",
  "Đánh giá thương hiệu và cảm xúc…",
  "Gần xong rồi, đang tổng hợp…",
];

export const REMIX_MESSAGES = [
  "Đang tạo các biến thể từ nội dung gốc…",
  "Đang viết lại theo angle khác nhau…",
  "Đang kiểm tra độ đa dạng…",
  "Gần xong rồi, đang hoàn thiện từng bản…",
];

export const VOICE_MESSAGES = [
  "AI đang đọc các bài viết mẫu…",
  "Đang phân tích từ vựng và cấu trúc câu…",
  "Đang nhận diện tone và quy tắc viết…",
  "Đang tổng hợp giọng văn, có thể mất thêm chút…",
];

export const DEFAULT_MESSAGE =
  "AI đang xử lý… Có thể mất 30–90 giây. Vui lòng không đóng trang.";
```

---

## Expected Output

Provide:
1. New files: `ai-loading-state.tsx`, `loading-messages.ts` (with full implementation)
2. Modified files: `breakdown-view.tsx`, `remix-form.tsx`, `voice-profile-form.tsx` (diffs or full file if small)
3. A brief summary of changes
4. Testing verification steps
