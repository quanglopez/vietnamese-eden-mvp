# Known limitations — Vietnamese Eden MVP (beta)

**Cập nhật:** 2026-06-02 (ALE-158 source quality badges)

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
| **URL-only content** | Lưu link được; **không** scrape caption/video/transcript — cần paste text thủ công trước Breakdown. UI hiển thị **badge chất lượng nguồn** (Metadata only / Cần dán thủ công) trên card và Breakdown — heuristic từ `raw_content`, chưa có cột DB (ALE-159). |
| **YouTube URL patterns** | Parser hỗ trợ `youtube.com/watch?v=VIDEO_ID` và `youtu.be/VIDEO_ID`. URL dạng khác (vd `/shorts/`, `/embed/`, playlist) có thể không enrich được — fallback message sẽ hiển thị. |
| **TikTok oEmbed** | TikTok thường **chặn oEmbed** từ server Vercel/IP range. App **fallback an toàn**: card hiển thị "TikTok" badge + URL + message hướng dẫn dùng Paste text. Không cần fix trừ khi user cohort 2 phàn nàn nhiều (P3 watch). |
| **AI output** | Gợi ý từ Xiaomi MiMo V2.5 — **cần review/chỉnh tay** trước khi đăng. |
| **Provider production** | `AI_PROVIDER=xiaomi`, model `mimo-v2.5`. Rollback OpenAI: đổi env trên Vercel (không phải user-facing). |
| **Remix 10 biến thể** | UI hỗ trợ tối đa **10**; latency và token **cao hơn** 3–5 biến thể; đôi khi cần thử lại nếu JSON parse fail (đã harden ALE-87). |
| **Rate limit / quota** | Phụ thuộc Xiaomi API key & billing; chưa có UI báo quota — lỗi hiển thị qua message tiếng Việt. |

---

## Publishing & tích hợp

| Giới hạn | Chi tiết |
|----------|----------|
|| **Không auto-post** | Calendar chỉ **lên lịch nội bộ / nhắc nhở** — bạn phải tự copy-paste và đăng thủ công lên MXH. Không tự động đăng lên Facebook, TikTok, LinkedIn, hay bất kỳ nền tảng nào. |
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
## Đã xử lý (không còn blocker beta)
- Workspace RLS (ALE-84/85)  
- OpenAI 500 trên production → chuyển Xiaomi MiMo (ALE-86)  
- Remix 5 biến thể JSON parse (ALE-87)  
- Google OAuth hide in beta (ALE-150)  
- Calendar no-auto-post UX (ALE-145)
- ALE-152 follow-ups: see ALE-153 (P1 non-Vietnamese leakage), TikTok oEmbed (P3 watch)
