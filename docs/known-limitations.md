# Known limitations — Vietnamese Eden MVP (beta)

**Cập nhật:** 2026-05-31 (ALE-88)

Danh sách giới hạn **cố ý hoặc chưa làm** trong bản beta. Không phải bug tạm thời trừ khi ghi rõ.

---

## Auth & tài khoản

| Giới hạn | Chi tiết |
|----------|----------|
| **Google OAuth** | Nút có trên UI; **chưa bật** trên Supabase Cloud production trừ khi owner cấu hình Google provider + redirect URLs. Dùng email/password. |
| **Forgot password + email `+`** | Supabase Auth có thể từ chối email dạng `user+tag@domain.com` (`Email address … is invalid`). Dùng email không có `+` hoặc alias riêng. |
| **Email confirm** | Tuỳ cấu hình Supabase project — có thể cần xác nhận email trước khi vào app. |

---

## Content & AI

| Giới hạn | Chi tiết |
|----------|----------|
| **URL-only content** | Lưu link được; **không** scrape caption/video/transcript — cần paste text thủ công trước Breakdown. |
| **AI output** | Gợi ý từ Xiaomi MiMo V2.5 — **cần review/chỉnh tay** trước khi đăng. |
| **Provider production** | `AI_PROVIDER=xiaomi`, model `mimo-v2.5`. Rollback OpenAI: đổi env trên Vercel (không phải user-facing). |
| **Remix 10 biến thể** | UI hỗ trợ tối đa **10**; latency và token **cao hơn** 3–5 biến thể; đôi khi cần thử lại nếu JSON parse fail (đã harden ALE-87). |
| **Rate limit / quota** | Phụ thuộc Xiaomi API key & billing; chưa có UI báo quota — lỗi hiển thị qua message tiếng Việt. |

---

## Publishing & tích hợp

| Giới hạn | Chi tiết |
|----------|----------|
| **Không auto-post** | Calendar chỉ **lên lịch nội bộ** — copy/export và đăng thủ công lên MXH. |
| **Không Stripe / billing** | MVP beta, chưa thu phí trong app. |
| **Team / client boards** | Filter Team/Client trên UI **disabled** — chỉ workspace cá nhân. |

---

## UI & thiết bị

| Giới hạn | Chi tiết |
|----------|----------|
| **Mobile 375px** | Layout **đọc được**; remix/calendar có thể **scroll ngang nhẹ** trên panel rộng. |
| **Auth pages mobile** | Tiêu đề dùng `h2` trong card — vẫn usable. |

---

## Dev / ops (không ảnh hưởng production user)

| Giới hạn | Chi tiết |
|----------|----------|
| **`AI_USE_MOCK` trên Vercel** | Không có hiệu lực (`NODE_ENV=production`). Mock chỉ local dev. |
| **Local `npm run build`** | Một số máy agent CI thấp RAM có thể OOM; **Vercel build PASS**. |

---

## Đã xử lý (không còn blocker beta)

- Workspace RLS (ALE-84/85)  
- OpenAI 500 trên production → chuyển Xiaomi MiMo (ALE-86)  
- Remix 5 biến thể JSON parse (ALE-87)  
