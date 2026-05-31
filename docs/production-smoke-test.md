# Production smoke test — Vercel + Supabase Cloud

**Base URL:** https://vietnamese-eden-mvp.vercel.app/

Chạy sau khi hoàn tất [supabase-cloud-setup.md](./supabase-cloud-setup.md) (env Vercel + migrations + auth URLs).

**Thời gian ước tính:** 20–30 phút (lần đầu, gồm signup/email).

**Không cần** commit secret. Dùng tài khoản test riêng.

---

## 0. Pre-flight (bắt buộc)

| # | Kiểm tra | Pass? | Ghi chú |
|---|----------|-------|---------|
| 0.1 | `curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase` → `"status":"ok"` | ☐ | Nếu error → xem supabase-cloud-setup |
| 0.2 | Vercel env: `NEXT_PUBLIC_SITE_URL=https://vietnamese-eden-mvp.vercel.app` | ☐ | |
| 0.3 | Vercel env: `AI_USE_MOCK=false` + `OPENAI_API_KEY` set | ☐ | AI features trên Vercel |
| 0.4 | Supabase redirect: `https://vietnamese-eden-mvp.vercel.app/auth/callback` | ☐ | |
| 0.5 | Trình duyệt: Chrome/Edge, cửa sổ ẩn danh (tránh session cũ) | ☐ | |

**Probe nhanh (không cần login):**

```bash
curl -s -o NUL -w "landing:%{http_code}\n" https://vietnamese-eden-mvp.vercel.app/
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

---

## 1. Landing page (public)

**URL:** https://vietnamese-eden-mvp.vercel.app/

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 1.1 | Mở `/` | Hero tiếng Việt, CTA "Dùng thử bản beta" / "Xem demo" | ☐ |
| 1.2 | Scroll các section | Problem, How it works, Features, Use cases, Pricing, FAQ | ☐ |
| 1.3 | Header **Đăng nhập** | → `/login` | ☐ |
| 1.4 | **Tham gia beta** / scroll `#waitlist` | Form name / email / use case hiện | ☐ |
| 1.5 | Submit waitlist (email test mới) | Success hoặc lỗi email trùng (tiếng Việt) | ☐ |
| 1.6 | DevTools Console | Không lỗi JS đỏ blocking | ☐ |
| 1.7 | Mobile ~375px | Layout đọc được, nút bấm được | ☐ |

**Data mẫu waitlist:**

- Họ tên: `Smoke Test`
- Email: `smoke+<ngày>@example.com` (email thật bạn kiểm tra được nếu cần)
- Use case: `Creator beauty TikTok, cần remix caption tiếng Việt cho beta.`

Xác nhận DB (optional): Supabase Table Editor → `beta_waitlist` có 1 row.

---

## 2. Signup / Login

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 2.1 | `/signup` — đăng ký user mới | Form OK, không crash | ☐ |
| 2.2 | Email confirmation (nếu bật) | Link mở → `/auth/callback` → `/dashboard` | ☐ |
| 2.3 | `/login` — đăng nhập | Vào `/dashboard` | ☐ |
| 2.4 | Mở `/dashboard` khi chưa login | Redirect `/login?next=...` | ☐ |
| 2.5 | Google OAuth (nếu đã cấu hình) | Login thành công | ☐ / N/A |

**Lỗi thường gặp:** redirect mismatch → sửa Supabase Redirect URLs.

---

## 3. Dashboard & Boards

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 3.1 | `/dashboard` | Load shell, không 500 | ☐ |
| 3.2 | CTA tới boards / sidebar **Bảng cảm hứng** | `/boards` | ☐ |
| 3.3 | **Tạo board** tên `Smoke Board <date>` | Board xuất hiện list | ☐ |
| 3.4 | Mở board detail | Grid content trống hoặc có item | ☐ |

Nếu không tạo được board: kiểm tra `handle_new_user` / `workspace_members` (migration #2).

---

## 4. Add content

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 4.1 | **Paste text** — dán đoạn tiếng Việt ≥ 50 ký tự | Card content mới | ☐ |
| 4.2 | **Dán link** — URL TikTok/FB (không text) | Card "chỉ URL" / hint rõ | ☐ |
| 4.3 | Refresh trang board | Items còn | ☐ |

**Text mẫu:**

```
3 mẹo hook beauty viral: nói lợi ích trong 2 giây, story 15s, CTA comment nhận checklist.
```

---

## 5. AI Breakdown

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 5.1 | Item **có text** → **Phân tích AI** | `/breakdown/[id]` load | ☐ |
| 5.2 | Chạy phân tích | Hook, Angle, Structure, CTA hiển thị | ☐ |
| 5.3 | Item **URL-only** → breakdown | Banner vàng, không gọi AI / message rõ | ☐ |
| 5.4 | Thiếu `OPENAI_API_KEY` (nếu test) | Message tiếng Việt, app không crash | ☐ |

---

## 6. Remix Generator

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 6.1 | Từ breakdown → **Tạo remix** | `/remix/[id]` | ☐ |
| 6.2 | Chọn format + tone, tạo 5 biến thể | ≥1 output hiển thị | ☐ |
| 6.3 | **Copy** một output | Toast / clipboard OK | ☐ |
| 6.4 | **Export .txt** hoặc .md | File tải về | ☐ |

---

## 7. Voice profile

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 7.1 | `/voice` → tạo profile mới | Form + lưu thành công | ☐ |
| 7.2 | Dán ≥500 ký tự mẫu caption TV | Summary / tone hiển thị | ☐ |
| 7.3 | Remix lại content đã breakdown | Chọn voice profile → outputs mới | ☐ |

---

## 8. Content Calendar

| # | Hành động | Kỳ vọng | Pass? |
|---|-----------|---------|-------|
| 8.1 | Từ remix output → **Đưa vào lịch** | Chọn ngày + kênh → toast OK | ☐ |
| 8.2 | `/calendar` | Item scheduled hiển thị | ☐ |
| 8.3 | **Hard refresh** (F5) | Item vẫn còn | ☐ |
| 8.4 | Đổi trạng thái (vd. Đã đăng) | UI cập nhật | ☐ |

---

## 9. Regression nhanh (routes)

| Route | Kỳ vọng | Pass? |
|-------|---------|-------|
| `/login` | 200 | ☐ |
| `/signup` | 200 | ☐ |
| `/forgot-password` | 200 | ☐ |
| `/` (logged out) | Landing, không redirect dashboard | ☐ |
| `/pricing` (logged in) | App shell, không 404 | ☐ |
| `/breakdown`, `/remix` (hub) | Hub + CTA boards | ☐ |

---

## 10. Kết quả smoke test

| Môi trường | Ngày | Tester | Kết quả |
|------------|------|--------|---------|
| Production | | | ☐ Pass / ☐ Fail |

**Blocking issues (ghi ID Linear nếu có):**

1. 
2. 

**Non-blocking / follow-up:**

1. 

---

## 11. So sánh local demo

| | Local (`AI_USE_MOCK=true`) | Production Vercel |
|--|---------------------------|-------------------|
| AI | Mock | OpenAI thật (cần key) |
| Supabase | `127.0.0.1:54321` | Cloud project |
| Site URL | `http://127.0.0.1:3000` | `https://vietnamese-eden-mvp.vercel.app` |

Script demo ngắn local: [demo-script.md](./demo-script.md)
