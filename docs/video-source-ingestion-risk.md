# Đánh giá rủi ro: Tích hợp RapidAPI video scraping cho YouTube/Instagram/TikTok

**Ngày:** 2026-06-07  
**Quyết định:** Mặc định KHÔNG cho MVP.  
**Phạm vi:** Tài liệu đánh giá — không có code, không có package, không có env var.

---

## 1. Các trường hợp sử dụng

| Use case | Mô tả |
|----------|-------|
| Lấy transcript YouTube | Dùng để phân tích AI breakdown viral content |
| Lấy caption TikTok | Dùng để remix content sang các nền tảng khác |
| Lấy caption/description Instagram | Dùng để phân tích hook và cấu trúc bài viết |
| Tự động hoá ingestion | Batch scraping nhiều video từ kênh/hashtag |

---

## 2. Rủi ro kỹ thuật

### RapidAPI Marketplace
- **Độ tin cậy thấp:** Các API trên RapidAPI marketplace do bên thứ ba vận hành, không có SLA đảm bảo. API có thể biến mất, đổi endpoint, hoặc tăng giá đột ngột.
- **Rate limit không dự đoán được:** Nhiều provider giới hạn request/ngày ở tier miễn phí, break production khi traffic tăng.
- **Không có hỗ trợ chính thức:** Khi lỗi xảy ra, không có kênh support đáng tin cậy.
- **Dữ liệu không nhất quán:** Schema response thay đổi không báo trước, gây lỗi runtime.

### Kỹ thuật chung
- Scraping APIs thường dùng workaround (headless browser, token giả) — dễ bị block theo batch khi platform cập nhật anti-bot.
- Latency cao (5–30s/request) không phù hợp với real-time UX.
- Không có caching layer → chi phí tăng theo mỗi request.

---

## 3. Rủi ro theo từng nền tảng

### YouTube
- **ToS Section 5.B:** Cấm rõ ràng việc scrape, crawl, hoặc extract dữ liệu ngoài YouTube Data API chính thức.
- **YouTube Data API v3** (chính thức) cung cấp captions qua `captions.list` + `captions.download` — nhưng chỉ với video của chính channel đã xác thực OAuth.
- Transcript public (auto-generated CC) không có endpoint chính thức — `youtube-transcript` npm package dựa trên undocumented endpoint, có thể bị block bất kỳ lúc nào.
- **Rủi ro tài khoản:** Vi phạm ToS có thể dẫn đến ban API key hoặc tài khoản Google Cloud.

### Instagram
- **Graph API** chỉ cấp caption của business account đã xác thực, không có transcript video.
- oEmbed API (đang dùng) chỉ trả về metadata công khai — title, thumbnail, không có caption đầy đủ.
- **ToS Section 3.2.1:** Cấm scraping, automated access ngoài API chính thức.
- Apify Instagram Scraper hiện được dùng như fallback — đây là grey area, Instagram đã nhiều lần kiện các scraper tool.

### TikTok
- **TikTok for Developers API** không cung cấp transcript.
- TikTok liên tục cập nhật anti-scraping (fingerprinting, token rotation).
- **Rủi ro pháp lý cao nhất** trong 3 nền tảng — TikTok đã kiện nhiều công ty scraping.
- Không có lộ trình official API cho caption/transcript.

---

## 4. Các giải pháp thay thế an toàn hơn

| Giải pháp | Độ an toàn | Phù hợp MVP |
|-----------|-----------|-------------|
| **Paste text thủ công** (hiện tại) | ✅ Cao | ✅ Có |
| **YouTube official captions API** (OAuth, channel owner only) | ✅ Cao | 🟡 Hạn chế |
| **youtube-transcript npm** (auto-generated CC) | 🟡 Trung bình | 🟡 Cẩn thận |
| **Whisper transcription** (user upload video) | ✅ Cao | 🔴 Phức tạp |
| **Apify** (Instagram/TikTok) | 🔴 Thấp | 🔴 Grey area |
| **RapidAPI scraping** | 🔴 Thấp | ❌ Không |

---

## 5. Lộ trình pilot an toàn cho tương lai

**Giai đoạn thí điểm (sau MVP):** User-pasted YouTube URL + manual transcript

1. **User paste YouTube URL** → hệ thống fetch metadata công khai (title, description, thumbnail) qua oEmbed — không scrape.
2. **Nếu video có auto-generated CC** → thử `youtube-transcript` với timeout 5s, fallback gracefully nếu fail.
3. **Nếu không có transcript** → hiện callout "Dán script bằng Paste text" — không block workflow.
4. **Không có automation:** Mỗi URL chỉ fetch khi user chủ động submit — không batch, không cron.

Đây là flow hiện tại đang được dùng (`youtube-transcript` + `YOUTUBE_TRANSCRIPT_ENABLED` flag).

---

## 6. Guardrails bắt buộc

Các ràng buộc này áp dụng cho mọi milestone, không được phép bypass:

| Guardrail | Lý do |
|-----------|-------|
| **Không bulk scraping** | Vi phạm ToS tất cả các platform, rủi ro ban account |
| **Không download video** | Vi phạm copyright, DMCA, luật bản quyền Việt Nam |
| **Không bypass platform restrictions** | Rủi ro pháp lý, ban account, reputational damage |
| **Không ingest content có bản quyền mà không có user permission** | User phải là chủ sở hữu hoặc có quyền sử dụng content |
| **Không automation trước khi có milestone được scope rõ ràng** | Tránh rủi ro không kiểm soát được ở production |
| **Không sử dụng RapidAPI scraping APIs** | Reliability thấp, ToS violation, không có SLA |

---

## 7. Quyết định

**MVP hiện tại dùng:**
- YouTube: `youtube-transcript` npm (opt-in qua `YOUTUBE_TRANSCRIPT_ENABLED=true`) + metadata fallback
- Instagram: oEmbed public metadata + Apify opt-in (`APIFY_API_TOKEN`)
- TikTok: metadata only (chưa có giải pháp an toàn)
- Mặc định: Paste text thủ công

**Không tích hợp RapidAPI** cho đến khi có milestone được approve rõ ràng với risk assessment đầy đủ.
