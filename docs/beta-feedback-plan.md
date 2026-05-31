# Beta feedback plan — Vietnamese Eden MVP

**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)  
**Cohort size:** 10–20 người (đợt 1)  
**Thời gian đề xuất:** 7–10 ngày test + 3 ngày gom feedback

Liên quan: [beta-onboarding.md](./beta-onboarding.md) · [beta-invite-message.md](./beta-invite-message.md) · [feedback-triage.md](./feedback-triage.md) · [manual-feedback-intake.md](./manual-feedback-intake.md) (chat thay Google Form)

Feedback source of truth:

[https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/](https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/)

---

## 1. Mục tiêu beta cohort


| Mục tiêu                                                                | Đo lường                                                                             |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Xác nhận **core flow** chạy được với user thật (không chỉ smoke nội bộ) | ≥ 80% cohort hoàn thành flow 8 bước trong [beta-onboarding.md](./beta-onboarding.md) |
| Thu **feedback có cấu trúc** về UX, AI quality, bug                     | Mỗi người ≥ 1 form / thread feedback                                                 |
| Phát hiện **P0/P1** trước khi mở rộng beta                              | 0 P0 chưa xử lý khi mở đợt 2                                                         |
| Hiểu **willingness to pay** sơ bộ (không bán trong beta)                | Ghi nhận pricing objection / giá trị cảm nhận                                        |


**Không phải mục tiêu đợt 1:** scale marketing, auto-post MXH, team workspace, billing.

---

## 2. Ai nên mời

Ưu tiên người **đã làm content hàng tuần** và chịu thử tool mới 15–25 phút:


| Nhóm                                             | Vì sao                                           |
| ------------------------------------------------ | ------------------------------------------------ |
| Creator solo (beauty, food, edu, personal brand) | Đúng persona MVP: swipe file → breakdown → remix |
| Freelancer / micro-agency 1–3 khách              | Test board theo niche/campaign                   |
| Người đã join **waitlist** + phản hồi nhanh      | Đã bày interest                                  |
| Quen team, báo bug kỹ (chỉ 2–3 người)            | Dogfood nội bộ — không quá 15% cohort            |


**Tránh đợt 1:** user chỉ xem landing; người không làm content; chỉ test 1 phút rồi biến mất (trừ khi cần smoke UX landing).

---

## 3. Tiêu chí chọn 10–20 người đầu tiên

Chấm **có / không** (chọn người đạt ≥ 4/6):


| #   | Tiêu chí                                                                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | Làm content **≥ 3 bài/tuần** (hoặc quản lý content cho khách)                                                     |
| 2   | Có **caption/script tiếng Việt** sẵn để paste (không chỉ link)                                                    |
| 3   | Sẵn sàng test trong **7 ngày** kể từ lời mời                                                                      |
| 4   | Báo feedback bằng **form hoặc chat** (không im lặng)                                                              |
| 5   | Dùng được **Chrome mobile hoặc desktop**                                                                          |
| 6   | Email đăng ký **không dùng `+`** (tránh lỗi forgot-password — xem [known-limitations.md](./known-limitations.md)) |


**Cân bằng cohort:**

- 60% creator solo · 30% freelancer/agency · 10% waitlist power users  
- Ít nhất **3 người test mobile** (375px)  
- Ít nhất **2 người** thử remix **10 biến thể** (latency/quality)

---

## 4. Flow test yêu cầu beta user làm

Gửi link [beta-onboarding.md](./beta-onboarding.md). **Bắt buộc** (đánh dấu checklist khi nhận feedback):

- Đăng ký / đăng nhập  
- Tạo workspace (nếu được hỏi) + board  
- Thêm content **paste text** (không chỉ URL)  
- **AI Breakdown** — chờ kết quả (ghi thời gian chờ nếu > 2 phút)  
- **Remix** ≥ 5 biến thể (format + tone tự chọn)  
- **Đưa 1 output vào lịch** + refresh trang calendar

**Khuyến khích (không bắt buộc):**

- Tạo **Voice profile** + remix lại 1 lần  
- Thử remix **10 biến thể** 1 lần  
- Copy/export 1 output

---

## 5. Câu hỏi feedback

Gửi sau khi họ báo “đã test xong” (Google Form / Typeform / Notion — owner chọn tool).

### A. Hoàn thành flow

1. Bạn đã hoàn thành được những bước nào trong checklist? (multi-select)
2. Bước nào **kẹt / bỏ cuộc** đầu tiên? (text ngắn)
3. Thời gian chờ AI (breakdown / remix) có chấp nhận được không? (1–5 + comment)

### B. Giá trị sản phẩm

1. Phần nào **hữu ích nhất**? (Breakdown / Remix / Voice / Calendar / Board)
2. Output AI có cần **chỉnh nhiều** trước khi đăng không? (1–5)
3. Bạn có trả phí ~___k VNĐ/tháng cho tool này không? Tại sao? (optional)

### C. UX & bug

1. Chỗ nào **khó hiểu** nhất? (screenshot welcome)
2. Có lỗi / message đỏ không? (paste text + URL trang)
3. Thiết bị: Desktop / Mobile / Cả hai?

### D. Mở

1. Một điều bạn muốn có **ngay tuần sau**? (feature request — không cam kết ship)

---

## 6. Cách phân loại feedback


| Loại                  | Ví dụ                                             | Xử lý                                  |
| --------------------- | ------------------------------------------------- | -------------------------------------- |
| **P0 blocker**        | Không tạo workspace, AI crash hàng loạt, mất data | Linear ngay; hotfix trong 48h          |
| **P1 bug lớn**        | Remix fail > 50% lần, login loop                  | Linear sprint hiện tại                 |
| **P2 polish**         | Spacing, copy nhỏ, scroll ngang nhẹ               | Backlog                                |
| **UX confusion**      | “Không biết bước tiếp theo”                       | Doc + micro-copy; có thể ALE UX        |
| **Feature request**   | Auto-post TikTok, scrape URL                      | Backlog / không hứa beta               |
| **Pricing objection** | “Đắt / chưa đủ giá trị”                           | Ghi cohort insights                    |
| **AI quality**        | Hook sai, giọng không khớp, tiếng Việt máy        | Prompt/provider tune; tag `ai-quality` |


Chi tiết triage: [feedback-triage.md](./feedback-triage.md)

---

## 7. Tiêu chí mở rộng beta (đợt 2: +20–50 user)

**Mở rộng** khi **tất cả** đúng:


| #   | Tiêu chí                                                      |
| --- | ------------------------------------------------------------- |
| 1   | **0 P0** mở từ cohort 1 (hoặc đã fix + xác nhận trên prod)    |
| 2   | ≥ **70%** cohort hoàn thành flow bắt buộc                     |
| 3   | ≥ **50%** cho điểm “sẽ tiếp tục dùng tuần sau” ≥ 4/5          |
| 4   | Không có pattern **AI cost** vượt ngưỡng owner (Xiaomi quota) |
| 5   | Support load ≤ **2 giờ/ngày** trung bình cho cohort hiện tại  |


**Hoãn mở rộng** nếu: ≥ 2 P0; hoặc ≥ 40% không hoàn thành breakdown; hoặc churn sau 1 session > 60%.

---

## 8. Timeline đề xuất


| Ngày   | Việc                                                            |
| ------ | --------------------------------------------------------------- |
| D0     | Gửi invite ([beta-invite-message.md](./beta-invite-message.md)) |
| D1–D3  | Onboarding + trả lời câu hỏi đăng ký                            |
| D4–D7  | Test flow + nhắc follow-up 48h                                  |
| D8     | Gửi form feedback + cảm ơn                                      |
| D9–D10 | Triage → **ALE-90**                                             |


---

## 9. Owner checklist trước khi gửi invite

- Supabase auth + RLS ổn trên production  
- Xiaomi env Vercel còn quota  
- Link onboarding + limitations sẵn sàng chia sẻ  
- Kênh nhận feedback (form URL + group chat)  
- Người trực trả lời bug trong 24h (ít nhất 1 người)

