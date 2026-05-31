# Vietnamese Eden MVP — Demo Script (3–5 phút)

Dùng cho beta demo nội bộ. Chuẩn bị `.env.local` với Supabase local/cloud và `AI_USE_MOCK=true` để không cần OpenAI key.

## Chuẩn bị môi trường

```env
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
AI_USE_MOCK=true
OPENAI_API_KEY=your_openai_api_key_here
```

Chạy: `npm run dev` → mở http://127.0.0.1:3000

## Data mẫu gợi ý

### Voice profile (≥500 ký tự)

Dán 2–3 đoạn caption TikTok tiếng Việt, cách nhau một dòng trống. Ví dụ tone gần gũi, xưng "mình", CTA comment.

### Content text (board)

```
3 điều mình ước biết sớm hơn khi làm content beauty...

1. Hook phải nói lợi ích trong 2 giây
2. Không dạy lý thuyết — kể story 15 giây
3. CTA mềm: comment để nhận checklist

Follow để xem phần 2.
```

### URL-only (demo message)

Chỉ dán `https://www.tiktok.com/@example/video/123` — không gọi AI breakdown/remix.

---

## Demo story (click-by-click)

| # | Bước | Kết quả mong đợi |
|---|------|-------------------|
| 1 | **Login** tại `/login` (hoặc signup) | Vào `/dashboard` |
| 2 | **Dashboard** → "Mở bảng cảm hứng" | `/boards` |
| 3 | **Tạo board** mới (VD: "Hook viral demo") | Board xuất hiện trong list |
| 4 | Mở board → **Thêm nội dung** → tab **Paste text** | Content card hiện trên grid |
| 5 | Thêm item **URL-only** (tab Dán link) | Card có hint "Chỉ có URL" |
| 6 | Trên item text → **Phân tích AI** | `/breakdown/[id]` — sections Hook, Angle, … |
| 7 | URL-only → mở breakdown | Banner vàng, không nút phân tích AI |
| 8 | Breakdown text → **Tạo remix** | `/remix/[id]` |
| 9 | Chọn format + tone → **Tạo 5 biến thể** | 5 outputs hiển thị |
| 10 | **Copy** / **Export .txt** một output | Toast "Đã copy" / file tải về |
| 11 | **Đưa vào lịch** → chọn ngày + kênh | Toast thành công |
| 12 | Sidebar **Giọng văn** → tạo profile | Profile hiển thị summary |
| 13 | Remix lại → chọn **Voice profile** | Output có ghi chú giọng (mock) |
| 14 | **Lịch 30 ngày** `/calendar` | Item scheduled hiển thị |
| 15 | **Refresh** trang calendar | Item vẫn còn |
| 16 | Đổi **trạng thái** → Đã đăng | Cập nhật trên card |

---

## Known limitations (beta MVP)

- Không auto-post lên Facebook/TikTok.
- Không scrape nội dung từ URL (URL-only cần thêm text thủ công để AI).
- Dashboard stats là hướng dẫn luồng, không phải analytics thật.
- Sidebar "Thêm nội dung" global → chuyển tới Boards (thêm trong board detail).
- `/breakdown` và `/remix` root là hub — luồng thật từ board/item.
- Billing/pricing chưa bật (`/pricing` = thông báo beta).
- Calendar status: `scheduled` / `published` / `skipped` (không có draft/ready riêng).
- Voice/Remix/Breakdown: production cần `OPENAI_API_KEY`; dev dùng mock.

---

## Troubleshooting nhanh

| Vấn đề | Cách xử lý |
|--------|------------|
| Không login được | Kiểm tra Supabase URL/anon key, auth redirect |
| AI lỗi thiếu key | Bật `AI_USE_MOCK=true` hoặc thêm `OPENAI_API_KEY` |
| Không thấy board | User cần `workspace_members` (seed/migration) |
| Remix báo chưa breakdown | Chạy Phân tích AI trước |
| Calendar trống | Thêm từ remix output, không từ hub |
