# Beta onboarding — Vietnamese Eden MVP

**Production:** https://vietnamese-eden-mvp.vercel.app/

Hướng dẫn cho **10–20 beta users** đầu tiên. Không cần cài đặt local.

---

## 1. Trước khi bắt đầu

- Dùng **Chrome / Edge** phiên bản mới (desktop hoặc mobile).
- Chuẩn bị **email không có dấu `+`** (vd. `ban@gmail.com`) cho đăng ký / quên mật khẩu.
- AI chạy trên server (**Xiaomi MiMo V2.5**) — cần mạng ổn định; mỗi lần phân tích/remix có thể mất **30 giây – 2 phút**.

---

## 2. Tạo tài khoản

1. Mở https://vietnamese-eden-mvp.vercel.app/signup  
2. Điền **Họ tên**, **Email**, **Mật khẩu** (≥ 8 ký tự).  
3. Nếu project bật xác nhận email → mở link trong hộp thư → vào app.  
4. Lần đầu vào **Bảng cảm hứng** có thể thấy **Tạo workspace** — bấm một lần.

**Chưa có quyền beta?** Gửi form waitlist trên landing: https://vietnamese-eden-mvp.vercel.app/#waitlist

---

## 3. Flow test đề xuất (15–25 phút)

| Bước | Việc làm | Kỳ vọng |
|------|----------|---------|
| 1 | **Dashboard** → **Bảng cảm hứng** → **Tạo bảng mới** | Board mới xuất hiện |
| 2 | Mở board → **Thêm content** → tab **Paste text** | Card content mới |
| 3 | **Phân tích AI** (Breakdown) | Hook, Angle, Structure, CTA hiển thị |
| 4 | **Tạo remix** — Format Facebook hoặc TikTok, **5 biến thể** | ≥ 5 output |
| 5 | (Tuỳ chọn) **Giọng văn** — dán ≥ 500 ký tự bài cũ → **Phân tích & lưu** | Profile lưu thành công |
| 6 | Remix lại với voice profile (nếu có) | Output bám giọng hơn |
| 7 | Một output → **Đưa vào lịch** | Toast OK |
| 8 | **Lịch nội dung** → refresh trang | Item còn trên lịch |

---

## 4. Data mẫu (paste text)

**Tiêu đề:** `Hook skincare viral test`

**Nội dung (≥ 50 ký tự):**

```text
3 mẹo hook beauty viral: nói lợi ích trong 2 giây, kể story 15 giây, CTA comment nhận checklist miễn phí. Đây là bản beta test Vietnamese Eden.
```

**Voice profile (≥ 500 ký tự):** dán 2–3 caption TikTok/Facebook bạn đã đăng, cách nhau một dòng trống.

---

## 5. Báo bug

Gửi cho team (Linear / email / group chat nội bộ):

1. **URL** trang đang mở  
2. **Bước** bạn vừa làm  
3. **Ảnh màn hình** + message lỗi (tiếng Việt trên UI)  
4. **Thời gian** (giờ VN) + trình duyệt (Chrome mobile/desktop)  
5. **Email tài khoản** (không gửi mật khẩu)

---

## 6. Không nên kỳ vọng ở bản beta

- Tự đăng lên TikTok / Facebook / Instagram  
- Tự tải transcript từ link TikTok/YouTube (URL-only = lưu link, chưa scrape)  
- Team workspace / billing / Stripe  
- Google đăng nhập (có thể chưa bật trên production)  
- AI luôn hoàn hảo — cần chỉnh tay trước khi đăng  
- Remix **10 biến thể** có thể **chậm hơn** và tốn token hơn 3–5 biến thể  

Chi tiết: [known-limitations.md](./known-limitations.md)

---

## 7. Tài liệu liên quan

| Doc | Mục đích |
|-----|----------|
| [known-limitations.md](./known-limitations.md) | Giới hạn sản phẩm |
| [production-smoke-test.md](./production-smoke-test.md) | Kết quả test nội bộ |
| [project-status.md](./project-status.md) | Snapshot trạng thái dự án |
