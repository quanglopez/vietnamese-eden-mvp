# Cursor Prompt — ALE-142: Improve Voice Profile Setup and Error Handling

## Issue
**Linear:** [ALE-142](https://linear.app/alexgpt/issue/ALE-142/ale-90b-improve-voice-profile-setup-and-error-handling)  
**Priority:** P1 (P0 origin from beta feedback)  
**Beta Evidence:** Voice Profile là friction lặp lại mạnh nhất. test.eden.vn gặp POST /api/voice-profile 500. 3/5 user không biết cần nhập bao nhiêu ký tự, cần ví dụ mẫu, và chưa rõ nếu API lỗi thì xử lý thế nào.

---

## Problem Statement

Voice Profile là tính năng khác biệt của Eden nhưng beta users report setup còn khó hiểu:

1. **Không rõ cần dán gì:** Placeholder chỉ nói "Dán từng bài, cách nhau bằng một dòng trống…" — user không biết nên dán caption, bài đăng fb, hay văn bản dài.
2. **Không rõ cần bao nhiêu ký tự:** Character counter tồn tại nhưng không đủ rõ ràng (chỉ hiển thị số lượng, không có visual feedback mạnh khi đủ/không đủ).
3. **Thiếu ví dụ mẫu:** User muốn thấy 1-2 ví dụ để copy format.
4. **Lỗi API chưa rõ:** Nếu POST /api/voice-profile 500, user chỉ thấy chung chung "Phân tích giọng viết thất bại" — không biết là lỗi mạng, lỗi server, hay input sai.
5. **Empty state chưa hấp dẫn:** Trang voice còn rỗng khi chưa có profile — cần thêm CTA rõ ràng hơn.

---

## Current Code Audit

### `src/components/custom/voice/voice-profile-form.tsx`
- Đã có `charCount` (line 25) và hiển thị `charCount / MIN_VOICE_SAMPLE_CHARS+` (lines 92-96)
- `MIN_VOICE_SAMPLE_CHARS = 500` (from constants)
- Button disabled khi `charCount < MIN_VOICE_SAMPLE_CHARS` (line 126)
- Placeholder: "Dán từng bài, cách nhau bằng một dòng trống…" (line 102)
- Error display đơn giản: `error` text inline below form (line 120-121)
- Input preservation: Đúng — fields chỉ clear khi success (lines 42-45), không clear khi error
- Tuy nhiên: không có `localStorage` backup — user refresh sẽ mất hết input

### `src/lib/voice/actions.ts` — `createVoiceProfileAction`
- Validation: name >= 2 chars, sample >= 500, <= 80,000 chars
- Error từ `AiProviderError`: trả về `error.message` trực tiếp — có thể là Tiếng Anh từ AI provider
- Error catch-all: `error instanceof Error ? error.message : "Phân tích giọng viết thất bại."` — chưa phân loại 500 vs validation vs network
- Không retry logic cho 500 error

### `src/components/custom/voice/voice-profile-detail.tsx`
- Hiển thị tone, vocabulary, sentence_style, cta_style, content_structure, common_openings, common_endings, banned_phrases, writing_rules, description
- Layout grid 2 cols cho 4 style sections — dễ đọc nhưng chưa có visual hierarchy mạnh
- Thiếu "copy to clipboard" cho bất kỳ section nào
- Thiếu action buttons (edit, rename, delete profile)

---

## Goal

Polish Voice Profile UX để user hiểu rõ:
1. Cần dán gì (examples)
2. Cần bao nhiêu (clearer char counter, visual feedback)
3. Nếu lỗi thì sao (categorized error messages)
4. Kết quả dễ đọc và actionable hơn

---

## Files to Modify

### Create new:
- `src/components/custom/voice/voice-sample-examples.tsx` — collapsible sample text component
- `src/components/custom/voice/voice-error-message.tsx` — categorized error display component

### Modify:
- `src/components/custom/voice/voice-profile-form.tsx` — main form improvements
- `src/components/custom/voice/voice-view.tsx` — empty state + overall layout
- `src/components/custom/voice/voice-profile-detail.tsx` — readability + actions
- `src/lib/voice/actions.ts` — better error categorization + messages

---

## Acceptance Criteria

### AC1: Voice Profile form — improved guidance
In `voice-profile-form.tsx`:
- Replace current placeholder with **rich inline guidance** above textarea:
  - "Dán **2–3 bài viết hoặc caption cũ** của bạn (mỗi bài cách nhau 2 dòng trống)."
  - "AI sẽ phân tích từ vựng, cách viết câu, hook, CTA style và quy tắc ngầm."
  - "Tối thiểu 500 ký tự. Nhiều hơn = giọng chính xác hơn."
- Add **character counter visual** — progress bar hoặc color indicator:
  - <500: text `text-destructive` (red), progress bar at `0%` or partial
  - 500-1000: text `text-amber-500` (yellow), progress at `50%`
  - >1000: text `text-brand` (green), progress at `100%`
  - Use `MIN_VOICE_SAMPLE_CHARS` constant — không hardcode 500
- Button text: change from "Phân tích & lưu profile" → "Huấn luyện AI với giọng của tôi"
- Thêm subtitle text giải thích VALUE: "Voice Profile giúp Remix viết đúng giọng bạn — không phải giọng AI chung chung."

### AC2: Sample text examples
Create `voice-sample-examples.tsx` (collapsible accordion hoặc inline):
- Tiêu đề: "📝 Xem ví dụ mẫu"
- Khi mở, hiển thị 2 ví dụ:

**Ví dụ 1 — Beauty/TikTok creator:**
```
Hôm nay mình thử serum mới, kết quả sau 7 ngày mà thấy da sáng hẳn. Mình không thích review kiểu chém gió, chỉ chia sẻ thật lòng. Nếu bạn cũng đang tìm sản phẩm phù hợp da dầu, comment bên dưới nhé — mình gửi review chi tiết hơn.

Mấy bạn hỏi mình dùng gì để da đẹp, hôm nay mình quay cả buổi skincare từ A-Z. Không quảng cáo, không PR, chỉ là routine mình làm mỗi tối. Đừng skip phần này vì đây là bí kíp mình đã test 6 tháng.
```

**Ví dụ 2 — Coach/Expert LinkedIn:**
```
Nhiều người nghĩ xây thương hiệu cá nhân là đăng thật nhiều. Nhưng vấn đề không nằm ở tần suất, mà nằm ở việc bạn có một góc nhìn rõ ràng, lặp lại đủ lâu, và biến trải nghiệm cá nhân thành bài học có ích cho người đọc.

Trong 3 năm đồng hành với hơn 200 founder, mình nhận ra điểm chung của người tạo nội dung hiệu quả: họ không viết về cái họ biết — họ viết về cái họ đã TRẢI QUA.
```

- Mỗi ví dụ có nút **"Dùng mẫu này"** — auto-fill textarea với sample text đó

### AC3: Better error categorization and messages
In `voice/actions.ts`:
- Giữ existing validation errors (name < 2, sample < 500, > 80k) — đã OK
- Improve `AiProviderError` handling:
  - If error message contains "timeout" / "timed out": return `"AI phân tích quá lâu. Hãy thử lại với mẫu viết ngắn hơn hoặc kiểm tra kết nối mạng."`
  - If error message contains "500" / "Internal": return `"Máy chủ AI đang bận. Hãy thử lại sau 30 giây."`
  - If error message contains "rate limit": return `"Bạn đã gửi quá nhiều yêu cầu. Hãy chờ 1 phút rồi thử lại."`  
  - Any other: return `"Phân tích giọng viết thất bại. Lỗi: ${error.message}`"
- In client side (`voice-profile-form.tsx`), wrap error with retry UI:
  - Show error in a `Card` with `variant="destructive"` or alert styling
  - Below error: Button "Thử lại" (disabled khi `isPending`)
  - Thêm helper text: "Nếu lỗi lặp lại, hãy thử tải lại trang hoặc liên hệ owner."

### AC4: Empty state improvement
In `voice-view.tsx` (lines 75-92), current empty state:
- Icon Mic + "Chưa có voice profile" + description

Improvement:
- Keep icon and title
- Change description: "Tạo voice profile đầu tiên — AI sẽ học cách bạn viết để remix đúng giọng hơn. Nhấn "Tạo Voice Profile mới" bên cạnh để bắt đầu."
- Thêm numbered steps nếu bạn muốn: (1) Dán bài viết cũ → (2) AI phân tích → (3) Dùng trong Remix
- **Bonus** (not required for AC): Thêm button "Tìm hiểu Voice Profile" linking to a tooltip or docs

### AC5: Voice Profile detail readability
In `voice-profile-detail.tsx`:
- Thêm `whitespace-pre-line` hoặc `prose` class cho text sections có chứa line breaks
- Đổi grid 2-col thành grid 1-col trên mobile, 2-col trên desktop (đã có responsive? Kiểm tra)
- Thêm icon cho mỗi section (use `lucide-react` icons):
  - 🎤 Tone → `Mic`
  - 📚 Từ vựng → `BookOpen`
  - ✍️ Kiểu câu → `PenTool`
  - 📢 CTA style → `Megaphone`
  - 🏗️ Cấu trúc → `Layout`

- Thêm button **"Sao chép quy tắc viết"** để copy `writing_rules` vào clipboard (chỉ `writing_rules` section)

### AC6: Input persistence (localStorage)
In `voice-profile-form.tsx`, add `useEffect` để:
- Save `name`, `description`, `sampleWritings` to `localStorage` (key: `voice-profile-draft`) khi user types (debounce 1s)
- On mount, if `localStorage` có draft, prompt user: "Phát hiện bản nháp chưa hoàn thành. Khôi phục?" (Yes/No)
- Clear `localStorage` khi submit success
- This prevents data loss on accidental refresh

### AC7: Build & type safety
- `npm run lint` pass
- `npm run type-check` pass
- `npm run build` pass hoặc `NODE_OPTIONS=--max-old-space-size=8192 npm run build` nếu OOM

---

## Constraints

- ❌ Do NOT change AI provider logic (MiMo / OpenAI / mock)
- ❌ Do NOT change Supabase schema
- ❌ Do NOT change `voice_profiles` table structure
- ❌ Do NOT remove existing fields (tone, style_notes, etc.)
- ✅ You MAY add new React components
- ✅ You MAY add localStorage persistence
- ✅ You MAY use existing shadcn/ui components
- ✅ You MAY add new icons from `lucide-react`
- ✅ You MAY change text/copy trong form UI

---

## Design Guidelines

- Giữ consistency với existing `AppShell` layout
- Dùng existing Tailwind tokens (`text-brand`, `text-destructive`, `bg-muted`, etc.)
- Copy tiếng Việt: warm, helpful, reassuring (không robotic)
- Character counter: dùng `Progress` từ shadcn/ui hoặc custom bar
- Sample text: để trong `<details>` / `<summary>` hoặc shadcn `Accordion` nếu có

---

## Testing Checklist

After implementation:
- [ ] Voice Profile form hiển thị guidance rõ (2-3 bài, 500+ ký tự)
- [ ] Character counter đổi màu theo progression (red → amber → green)
- [ ] Click "Xem ví dụ mẫu" → thấy 2 ví dụ → click "Dùng mẫu này" → textarea được auto-fill
- [ ] Error 500 → message "Máy chủ AI đang bận. Hãy thử lại sau 30 giây."
- [ ] Error timeout → message "AI phân tích quá lâu..."
- [ ] Input được preserve khi error (form fields không mất)
- [ ] Refresh page khi đang nhập → localStorage prompt "Khôi phục bản nháp?"
- [ ] Voice Profile detail có icons cho từng section
- [ ] Build passes

---

## Expected Output

Provide:
1. New files if any: `voice-sample-examples.tsx`, `voice-error-message.tsx`
2. Modified files: `voice-profile-form.tsx`, `voice-view.tsx`, `voice-profile-detail.tsx`, `voice/actions.ts`
3. Brief summary of changes
4. Testing verification steps
