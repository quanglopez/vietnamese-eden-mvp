# Cursor Prompt — ALE-177: Beta Tester Onboarding Guide + Support Checklist

> **Issue:** ALE-177 — Beta tester onboarding guide + support checklist
> **Project:** M12 — Beta Launch & Activation
> **Planned by:** Hermes (2026-06-05)
> **Status:** READY FOR OWNER REVIEW — do NOT implement yet

---

## Decision: Docs-only (recommended over Admin UI)

**Why docs-only:**

The content already exists — scattered across 4 docs:
- `beta-invite-message.md` — copy-paste invitation templates
- `beta-onboarding.md` — step-by-step tester guide (ALE-168)
- `beta-feedback-workflow.md` — feedback collection + normalization (ALE-169)
- `known-limitations.md` — beta limitations reference

But an owner onboarding a tester must jump between 4+ files. ALE-177 consolidates these into ONE cohesive owner workflow.

Admin UI was considered but rejected:
- Adding `/admin/beta-onboarding` with per-tester progress tracking would require either:
  - A migration (new columns/table for step-by-step tracking) — out of scope for a planning phase
  - Deriving progress from `analytics_events` (unreliable — `workspace_id=null` for signup/login events, noted in M10 limitations)
- The `/admin/beta-launch` dashboard already has a static support checklist
- Docs-only: zero migration, zero build/lint/type-check, zero risk, immediately usable

---

## Context

You are creating **two docs** that consolidate the owner's beta tester onboarding workflow for Vietnamese Eden MVP:

1. `docs/beta-tester-onboarding-guide.md` — THE single doc the owner sends to each tester
2. `docs/beta-support-checklist.md` — THE owner's per-tester tracking sheet

## Existing Reusable Docs (reference, do NOT duplicate wholesale)

These docs already contain relevant content. Reference them, link to them, but do NOT copy them verbatim into the new docs:

| Existing Doc | Contains | How to reference |
|---|---|---|
| `docs/beta-invite-message.md` | 4 message templates (short, long, follow-up, thank-you) + channel notes | Link as "copy-paste từ [beta-invite-message.md](./beta-invite-message.md)" |
| `docs/beta-onboarding.md` | 9-section guide: prerequisites, account creation, workspace, test flow, paste-vs-URL, sample data, bug reporting, limitations, related docs | Link as "hướng dẫn chi tiết: [beta-onboarding.md](./beta-onboarding.md)" |
| `docs/beta-feedback-workflow.md` | Intake sources, normalization, P0-P3 rubric, weekly summary template | Link as "quy trình feedback: [beta-feedback-workflow.md](./beta-feedback-workflow.md)" |
| `docs/known-limitations.md` | Auth, AI, publishing, UI/device, dev limitations | Link as "giới hạn beta: [known-limitations.md](./known-limitations.md)" |

---

## File 1: `docs/beta-tester-onboarding-guide.md`

### Purpose

The ONE doc the owner shares with each beta tester. Combine the invite message + step-by-step guide + known limitations + feedback request into a single linked narrative.

### Structure

```
# Beta Tester Onboarding Guide — Vietnamese Eden MVP

**Dành cho:** Tester được mời tham gia beta
**Thời gian:** ~20 phút
**Production:** https://vietnamese-eden-mvp.vercel.app

---

## 1. Lời mời (copy-paste cho tester)

[Short invite message — synthesized from beta-invite-message.md §1]
- Greeting + what Vietnamese Eden is (1 sentence)
- Signup link
- Key notes: email+password only, workspace name, ~20 min
- Feedback request: 3 questions after testing
- Link to this guide

## 2. Bắt đầu — 5 phút

### 2.1 Tạo tài khoản
[Condensed from beta-onboarding.md §2]
- Signup URL, fields, email confirm note

### 2.2 Workspace
[Condensed from beta-onboarding.md §3]
- What it is, name suggestion, one workspace only

## 3. Flow test chính — 15 phút

[Numbered step-by-step, condensed from beta-onboarding.md §4]

| Bước | Việc làm | ⏱️ | Kỳ vọng |
|------|----------|-----|---------|
| 1 | Dashboard → Bảng cảm hứng → Tạo bảng mới | 1p | Board mới |
| 2 | Mở board → Thêm content → Paste text | 2p | Card content |
| 3 | Phân tích AI (Breakdown) | 1-2p | Hook/Angle/CTA |
| 4 | Tạo remix — 5 biến thể | 2-3p | ≥5 output |
| 5 | Giọng văn → Huấn luyện | 2-3p | Profile lưu |
| 6 | Remix với voice profile | 2p | Output bám giọng |
| 7 | Đưa vào lịch | 1p | Toast OK |
| 8 | Gửi feedback | 2p | Form hoặc chat |

Include reminder: AI chậm 30-120s là bình thường. Không refresh trang khi đang chạy.

### 3.1 Paste text vs URL
[Condensed from beta-onboarding.md §5]
- Paste text: AI phân tích đầy đủ
- URL: chỉ lưu link, chưa scrape

### 3.2 Data mẫu
[From beta-onboarding.md §6 — the hook skincare viral test]

## 4. Cần bạn feedback gì?

After testing, the tester should answer:
1. Bước nào dễ nhất? Bước nào khó/chậm nhất?
2. Output AI có dùng được không? (hook, remix, voice)
3. Bạn có sẵn sàng trả tiền không? Nếu có, bao nhiêu/tháng?

Form URL: [Google Form from beta-feedback-workflow.md]

## 5. Gặp vấn đề?

### Troubleshooting FAQ
| Vấn đề | Cách xử lý |
|--------|-----------|
| Không đăng nhập được | Kiểm tra email không có dấu `+`. Thử forgot password. |
| AI báo lỗi đỏ | Chụp màn hình gửi owner. Có thể rate-limit — thử lại sau 1-2 phút. |
| Dashboard trống sau login | Vào thẳng /boards hoặc refresh. Có thể cần tạo workspace. |
| Không thấy Calendar | Menu sidebar → "Lịch 30 ngày". Không phải Google Calendar. |
| Mobile bị scroll ngang | Dùng desktop nếu được. Mobile readable nhưng chưa tối ưu. |
| Quên mật khẩu | Trang login → "Quên mật khẩu?". Email reset sẽ gửi trong vài phút. |

## 6. Giới hạn bản beta (đừng kỳ vọng)
[Condensed from known-limitations.md]
- Calendar không tự động đăng lên MXH
- URL không scrape nội dung (phải paste text)
- Chưa có Google login
- Chưa có Stripe / billing / thu phí
- AI output cần review trước khi dùng thật

## 7. Tài liệu liên quan
[Links to beta-onboarding.md, beta-feedback-workflow.md, known-limitations.md]
```

### Content rules

- Vietnamese only (except technical terms like "workspace", "remix", "breakdown")
- Friendly but concise tone
- Each section should be scannable — use tables and bullet points
- Link to existing docs instead of duplicating
- Include the Google Form URL for feedback from `beta-feedback-workflow.md`
- No pricing promises, no feature promises

---

## File 2: `docs/beta-support-checklist.md`

### Purpose

Owner's internal tracking sheet. One row per tester. Owner checks off each step as the tester completes it.

### Structure

```
# Beta Support Checklist — Vietnamese Eden MVP

**Dành cho:** Owner/workspace admin
**Mục đích:** Theo dõi tiến độ onboarding từng tester
**Cập nhật:** Thủ công — owner tự đánh dấu

---

## Cách dùng

1. Copy bảng bên dưới vào Google Sheet hoặc Notion.
2. Mỗi tester = 1 dòng.
3. Đánh dấu ✅ khi tester hoàn thành bước đó.
4. Cột "Notes" ghi lại vấn đề, feedback thô, WTP signal.
5. Sau khi tester hoàn thành hết → chuyển sang feedback triage (link beta-feedback-workflow.md).

## Checklist

| # | Tester | Invite | Account | Login | Board | Content | Breakdown | Remix | Voice | Calendar | Feedback | WTP | Notes |
|---|--------|--------|---------|-------|-------|---------|-----------|-------|-------|----------|----------|-----|-------|
| 1 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 2 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 3 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 4 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 5 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |

*(Thêm dòng khi cần — mỗi tester mới = 1 dòng mới)*

## Cột giải thích

| Cột | Ý nghĩa | Cách xác nhận |
|-----|---------|--------------|
| **Tester** | Tên / email tester | — |
| **Invite** | Đã gửi lời mời (Telegram/Zalo/Email) | Owner check thủ công |
| **Account** | Đã tạo tài khoản trên app | Kiểm tra /admin/beta-testers |
| **Login** | Đã đăng nhập ít nhất 1 lần | analytics_events hoặc hỏi tester |
| **Board** | Đã tạo ít nhất 1 board | analytics_events: board_created |
| **Content** | Đã thêm ít nhất 1 content | analytics_events: content_added |
| **Breakdown** | Đã chạy AI Breakdown ít nhất 1 lần | analytics_events: breakdown_run |
| **Remix** | Đã tạo ít nhất 1 remix | analytics_events: remix_created |
| **Voice** | Đã tạo Voice Profile | Kiểm tra voice_profiles table |
| **Calendar** | Đã thêm ít nhất 1 item vào lịch | analytics_events: calendar_added |
| **Feedback** | Đã gửi feedback (form/chat) | Kiểm tra /admin/feedback |
| **WTP** | Willingness-to-pay signal | Ghi số tiền hoặc "no"/"maybe" |

## Follow-up triggers

| Trigger | Hành động |
|---------|----------|
| Invite >48h, chưa Account | Gửi follow-up message (beta-invite-message.md §3) |
| Account >48h, chưa Breakdown | Nhắn reminder + tip: dùng Paste text |
| Breakdown >48h, chưa Feedback | Gửi thank-you + form reminder (beta-invite-message.md §4) |
| WTP = "yes, >100k VND" | Ghi vào notes → dùng cho pricing decision sau |
| Gặp bug/lỗi | Screenshot → Linear bug issue → follow-up với tester |
```

### Content rules

- Markdown table format with ☐ (unchecked) checkboxes
- Owner fills in tester names manually
- Link to analytics_events for data-backed verification where possible
- Link to existing docs for follow-up actions

---

## Implementation Steps (for Cursor)

1. Create `docs/beta-tester-onboarding-guide.md` with the structure above.
2. Create `docs/beta-support-checklist.md` with the checklist table above.
3. Verify both files:
   - All links to existing docs resolve correctly
   - Google Form URL is correct (from beta-feedback-workflow.md)
   - Vietnamese copy, no English unless technical term
   - Markdown renders cleanly (tables aligned, checkboxes valid)
4. Optional: add a link from `/admin/beta-launch` support checklist section to `beta-support-checklist.md` (but NOT required — keep scope minimal).

---

## Verification

- **Lint:** Not applicable (markdown only, no code changes)
- **Type-check:** Not applicable
- **Build:** Not applicable (no app code changed)
- **Visual:** Open both .md files in GitHub preview or VS Code — verify tables render, links work, Vietnamese readable
- **Smoke `/admin/beta-launch`:** Unaffected — no code changes

---

## Guardrails

- No migration
- No schema changes
- No app code changes
- No sidebar changes
- No new admin pages
- No automated messaging
- No Google Sheets/OAuth
- No pricing/paywall/payment changes
- No Stripe dependency

---

## Files to create

| File | Purpose |
|------|---------|
| `docs/beta-tester-onboarding-guide.md` | Single doc owner sends to testers |
| `docs/beta-support-checklist.md` | Owner's per-tester tracking sheet |

## Files NOT to modify

- `docs/beta-onboarding.md` — existing, linked from guide, not replaced
- `docs/beta-invite-message.md` — existing, linked from guide, not replaced
- `docs/beta-feedback-workflow.md` — existing, linked from guide, not replaced
- `docs/known-limitations.md` — existing, linked from guide, not replaced
- `src/app/(app)/admin/beta-launch/page.tsx` — existing, unaffected
- `src/components/custom/app/app-sidebar.tsx` — existing, no nav change

---

## DO NOT

- Merge PR
- Mark PR ready
- Move Linear issue to Done
- Commit without owner confirmation
- Add any migration
- Add any app code
- Add sidebar nav entry
- Duplicate existing doc content verbatim — link instead
