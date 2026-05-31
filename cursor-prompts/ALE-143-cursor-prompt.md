# Cursor Prompt — ALE-143: Clarify Beta Onboarding and Core Flow Instructions

## Issue
**Linear:** [ALE-143](https://linear.app/alexgpt/issue/ALE-143/ale-90c-clarify-beta-onboarding-and-core-flow-instructions)  
**Priority:** P2  
**Type:** Docs only — **không sửa app code**  
**Beta Evidence:** Feedback round 1 có nhiều audit notes về signup/workspace/paste text vs URL/remix-vs-voice order. Cần cập nhật docs trước khi invite cohort 2.

---

## Problem Statement

Beta users confused about:
1. **Google OAuth** — Nút "Đăng nhập Google" hiển thị nhưng chưa bật, user click vào bị lỗi
2. **Workspace** — Solo creator không hiểu workspace là gì, tại sao phải tạo, đặt tên gì
3. **Paste text vs URL** — User dán URL nghĩ AI sẽ phân tích, nhưng URL-only chỉ lưu link chưa scrape
4. **Flow order** — Chưa rõ nên remix trước hay tạo Voice Profile trước
5. **Loading state** — Beta docs chưa cảnh báo "đừng refresh khi AI đang chạy"

---

## Goal

Cập nhật 2 docs files để beta cohort 2 không gặp lại confusion này. Chỉ sửa markdown, không động đến app code.

---

## Files to Modify

### Modify:
- `docs/beta-onboarding.md` — hướng dẫn chính cho beta users
- `docs/beta-invite-message.md` — templates gửi tin mời beta

### Read-only reference (không sửa):
- `docs/known-limitations.md` — để đảm bảo consistency
- `docs/project-status.md` — để đảm bảo link đúng

---

## Acceptance Criteria

### AC1: `docs/beta-onboarding.md`

Thêm/cập nhật các section sau:

**§2 — Tạo tài khoản:**
- Thêm warning:
  > ⚠️ **Đăng nhập:** Chỉ dùng **email + password**. Google OAuth hiện chưa bật trên production — đừng nhấn "Đăng nhập Google" nếu thấy nút đó.

**§3 — Workspace là gì? (NEW section, đặt trước Flow test):**
- Giải thích workspace đơn giản:
  > Workspace = **không gian làm việc / folder lớn** của bạn.
  > Solo creator có thể đặt tên **"Cá nhân"** hoặc **"Content của [Tên bạn]"**.
  > Chỉ cần tạo **một workspace duy nhất** — tất cả board sẽ nằm trong đó.
  > Không cần thay đổi workspace sau khi tạo.

**§4 — Flow test đề xuất:**
- Thêm dòng:
  > **⚠️ Thứ tự quan trọng:**
  > - Nếu chưa có Voice Profile: làm **remix baseline trước** → tạo Voice Profile → **remix lại để so sánh** sự khác biệt.
  > - Nếu đã có Voice Profile: chọn voice khi tạo remix ngay từ đầu.
- Thêm dòng:
  > **⏳ AI chậm là bình thường:** Breakdown 30–90s, Remix 30–120s, Voice Profile 60–120s. **Không refresh trang** khi đang chạy — AI vẫn đang xử lý phía sau.

**§5 — Paste text vs URL (NEW section):**
- Tạo comparison table:

| Cách thêm | Khi nào dùng | AI phân tích được? |
|-----------|--------------|-------------------|
| **Paste text** ✅ | Bạn có nội dung sẵn (caption, script, bài đăng) | **Có** — Breakdown, Remix, Voice đều hoạt động |
| **URL** 🔗 | Bạn muốn lưu link để tham khảo sau | **Chưa** — URL-only chỉ lưu link, chưa scrape/transcript. Muốn AI phân tích sâu thì phải dùng **Paste text** và dán nội dung vào. |

- Thêm tip:
  > 💡 **Mẹo:** Khi thấy content viral trên TikTok/YouTube, copy caption/script và dán qua **Paste text** để AI phân tích đầy đủ.

**§7 — Báo bug:**
- Thêm escape hatch:
  > 🔧 **Bị kẹt ở đâu?** Chụp màn hình gửi owner ngay — đừng cố refresh nhiều lần.

**§9 — Tài liệu liên quan:**
- Thêm link: `[beta-feedback-round-1.md](./beta-feedback-round-1.md)` vào bảng

### AC2: `docs/beta-invite-message.md`

**§1 — Tin ngắn (Telegram/Zalo/Messenger):**
- Thêm ngay sau link signup:
  > ⚠️ Đăng ký: chỉ dùng email + password. Google login chưa bật.
  > 📋 Workspace: đặt tên "Cá nhân" hoặc "Content của [Tên bạn]" — chỉ cần 1 workspace.
- Thêm trước câu hỏi feedback:
  > 💡 Nhớ: muốn AI phân tích sâu thì dùng **Paste text** (dán caption/script vào). URL chỉ lưu link, chưa scrape nội dung.

**§2 — Bản dài (Email/DM):**
- Thêm sau bước 1 (signup):
  > ⚠️ Chỉ dùng **email + password** — Google OAuth chưa bật trên production.
- Thêm bước 2 (workspace):
  > Tạo workspace: đặt tên đơn giản như "Cá nhân" — chỉ cần 1 workspace.
- Thêm bước 4 (paste vs URL):
  > Paste text vs URL:
  > • Dùng **Paste text** khi có caption/script sẵn → AI phân tích đầy đủ
  > • Dùng **URL** chỉ để lưu link tham khảo → AI chưa scrape/transcript
- Thêm bước 5 (flow order):
  > Thứ tự đề xuất:
  > • Remix baseline trước (chưa voice) → tạo Voice Profile → remix lại để so sánh
- Thêm cảnh báo:
  > ⏳ AI chậm 1–2 phút là bình thường — đừng refresh trang khi đang chạy.

**§3 — Follow-up (đã đăng ký nhưng chưa test AI):**
- Thêm:
  > 💡 Dùng **Paste text** để AI phân tích sâu. URL chỉ lưu link, chưa scrape.
  > ⏳ AI chậm 1–2 phút là bình thường. Không refresh trang khi đang chạy.
  > 🔧 Gặp lỗi đỏ thì chụp màn hình gửi mình.

---

## Constraints

- ❌ **Không sửa app code** — không động đến src/
- ❌ **Không đổi schema/env**
- ❌ **Không thêm dependencies**
- ✅ Chỉ sửa 2 files markdown trong docs/
- ✅ Giữ tone hiện tại (friendly, tiếng Việt, dễ hiểu)
- ✅ Không xóa section cũ — chỉ thêm hoặc tinh chỉnh

---

## Testing Checklist

Sau khi sửa docs:
- [ ] `beta-onboarding.md` có section "Workspace là gì?"
- [ ] `beta-onboarding.md` có bảng "Paste text vs URL"
- [ ] `beta-onboarding.md` có warning về Google OAuth
- [ ] `beta-onboarding.md` có recommended flow order
- [ ] `beta-onboarding.md` có escape hatch "chụp màn hình gửi owner"
- [ ] `beta-invite-message.md` (short) có OAuth warning + workspace tip + paste vs URL
- [ ] `beta-invite-message.md` (long) có OAuth + workspace + paste vs URL + flow order + loading warning
- [ ] `beta-invite-message.md` (follow-up) có paste text reminder + loading warning
- [ ] Không có file src/ nào bị sửa

---

## Expected Output

Chỉ trả về 2 files đã sửa:
1. `docs/beta-onboarding.md` — full file content
2. `docs/beta-invite-message.md` — full file content

Kèm brief summary các thay đổi chính.
