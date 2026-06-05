# Beta Support Checklist — Vietnamese Eden MVP

**Dành cho:** Owner / workspace admin
**Mục đích:** Theo dõi tiến độ onboarding từng tester
**Cập nhật:** Thủ công — owner tự đánh dấu

---

## Cách dùng

1. Copy bảng bên dưới vào Google Sheet hoặc Notion.
2. Mỗi tester = 1 dòng.
3. Đánh dấu ✅ khi tester hoàn thành bước đó.
4. Cột **Notes** ghi lại vấn đề, feedback thô, WTP signal.
5. Sau khi tester hoàn thành hết → chuyển sang feedback triage ([beta-feedback-workflow.md](./beta-feedback-workflow.md)).

---

## Checklist

| # | Tester | Invite | Account | Login | Board | Content | Breakdown | Remix | Voice | Calendar | Feedback | WTP | Notes |
|---|--------|--------|---------|-------|-------|---------|-----------|-------|-------|----------|----------|-----|-------|
| 1 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 2 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 3 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 4 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |
| 5 |        | ☐      | ☐       | ☐     | ☐     | ☐       | ☐         | ☐     | ☐     | ☐        | ☐        | ☐   |       |

*(Thêm dòng khi cần — mỗi tester mới = 1 dòng mới)*

---

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

---

## Support Triage

Khi tester báo vấn đề, phân loại theo bảng dưới. Mỗi vấn đề → ghi vào Notes của tester đó.

| Loại | Mô tả | Hành động |
|------|-------|----------|
| **P0 blocker** | Không vào được app, mất data, crash | Fix ngay, thông báo tester |
| **P1 major bug** | Core flow bị lỗi (breakdown/remix fail) | Linear issue, fix trong sprint |
| **P2 polish** | Lỗi nhỏ có workaround | Backlog Linear |
| **UX confusion** | Không hiểu bước tiếp theo | Cập nhật doc/copy; Linear nếu ≥2 user |
| **AI quality issue** | Output sai, lệch, không tự nhiên | Tag `ai-quality` trong Linear; tune prompt |
| **Feature request** | Tính năng mới | Backlog FR: issue, không cam kết |
| **Pricing objection** | "Chưa đáng X/tháng" | Ghi insight; không code action |
| **Positive signal** | "Hay", "đúng ý mình" | Ghi insight; chia sẻ team |

---

## Follow-up Triggers

| Trigger | Hành động |
|---------|----------|
| Invite >48h, chưa Account | Gửi follow-up message ([beta-invite-message.md §3](./beta-invite-message.md)) |
| Account >48h, chưa Breakdown | Nhắn reminder + tip: dùng Paste text |
| Breakdown >48h, chưa Feedback | Gửi thank-you + form reminder ([beta-invite-message.md §4](./beta-invite-message.md)) |
| WTP = "yes, >100k VND" | Ghi vào notes → dùng cho pricing decision sau |
| Gặp bug/lỗi | Screenshot → Linear bug issue → follow-up với tester |
| Pattern ≥2 tester cùng vấn đề | Linear issue ngay (P1 nếu core flow, P2 nếu UX) |

---

## Manual Workflow

Sau khi tester gửi feedback:

1. **Copy feedback thô** vào `/admin/feedback` (paste thủ công)
2. **Normalize** theo [beta-feedback-workflow.md](./beta-feedback-workflow.md) — phân loại bug/ux/fr/ai/price/positive
3. **Tạo Linear issue** chỉ sau khi owner review feedback đã normalize
4. **Không** gửi automated message — owner tự nhắn follow-up thủ công

---

## Tài liệu liên quan

| Doc | Dùng khi |
|-----|----------|
| [beta-tester-onboarding-guide.md](./beta-tester-onboarding-guide.md) | Gửi cho tester mới — guide + invite + FAQ |
| [beta-invite-message.md](./beta-invite-message.md) | Cần mẫu tin nhắn invite/follow-up/cảm ơn |
| [beta-onboarding.md](./beta-onboarding.md) | Hướng dẫn chi tiết từng bước |
| [beta-feedback-workflow.md](./beta-feedback-workflow.md) | Quy trình normalize feedback + triage |
| [known-limitations.md](./known-limitations.md) | Giới hạn beta cần biết |
| [admin/beta-launch](/admin/beta-launch) | Dashboard tổng quan beta |
