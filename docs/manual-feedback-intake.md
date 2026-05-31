# Manual feedback intake — Vietnamese Eden MVP beta

**Mục đích:** Thu và chuẩn hóa feedback từ beta users gửi **tin nhắn tự do** (Telegram / Zalo / email / DM) — không bắt họ điền Google Form.

**Production:** https://vietnamese-eden-mvp.vercel.app/

Liên quan: [beta-feedback-plan.md](./beta-feedback-plan.md) · [beta-invite-message.md](./beta-invite-message.md) · [feedback-triage.md](./feedback-triage.md)

---

## 1. Khi nào dùng manual feedback thay Google Form

| Dùng **manual intake** (doc này) | Dùng **Google Form** |
|----------------------------------|----------------------|
| User chỉ muốn nhắn 3–5 câu, không mở link form | User OK điền form 5–10 phút |
| Kênh chat quen (Zalo/Telegram) — reply thread | Cần số liệu cohort đồng nhất (export CSV) |
| Feedback kèm screenshot/voice note rải rác | So sánh điểm 1–5 giữa nhiều user |
| Dogfood nội bộ / user quen team | Báo cáo ALE-90 cần metric form chuẩn |

**Khuyến nghị cohort 1:** Form là **mặc định**; manual là **fallback** — vẫn phải chuẩn hóa về cùng schema trước khi triage.

---

## 2. Tin nhắn 3 câu hỏi gửi user

Copy khi user báo “test xong rồi” nhưng không muốn form:

```
Cảm ơn bạn đã test Vietnamese Eden 🙌

Bạn trả lời giúp mình 3 câu (tin nhắn tự do, không cần form):

1) Bước nào **dễ / hữu ích nhất**?
2) Bước nào **khó / chậm / kẹt** nhất? (URL trang + screenshot nếu có lỗi)
3) **Một điều** bạn muốn cải thiện ngay?

(Tuỳ chọn: desktop hay mobile? Remix mấy biến thể?)

Cảm ơn — feedback của bạn giúp team ưu tiên fix đúng chỗ.
```

**Gợi ý thêm** nếu user chỉ gửi 1 câu chung chung:

```
Bạn đã làm tới bước nào: board → breakdown → remix → calendar?
Chỗ AI chờ khoảng bao lâu — chấp nhận được không?
```

---

## 3. Format lưu raw feedback

Lưu **nguyên văn** trước khi AI/owner chuẩn hóa. Một file hoặc một row Notion/Sheet.

### Template raw (copy mỗi lần nhận feedback)

```markdown
## RAW-[YYYYMMDD]-[001]

| Field | Value |
|-------|--------|
| Received at | 2026-05-31 15:30 +07 |
| Channel | Telegram / Zalo / Email / DM |
| Cohort | cohort-1 |
| Reporter name | [Tên] |
| Contact | [handle — không password] |
| Signup email (optional) | [email nếu user đồng ý] |
| Device | Desktop / Mobile / Unknown |
| Screenshots | [link file hoặc "None"] |

### Verbatim (copy-paste từ user)

"""
[Paste toàn bộ tin user, giữ emoji và lỗi chính tả]
"""

### Attachments / notes from owner

- [URL trang user nhắc]
- [Screenshot filename]
```

**Quy tắc lưu:**

- Không sửa verbatim khi paste vào block trên.
- Không commit screenshot có email/password vào git public.
- ID tăng dần: `RAW-20260531-001`, `002`, …

---

## 4. Chuẩn hóa → format giống Google Form

Map manual → các field trong [beta-feedback-plan.md](./beta-feedback-plan.md) §5. Field không suy ra được → **`Unknown`**.

### Bảng mapping

| Form field (beta-feedback-plan §5) | Nguồn từ manual |
|-----------------------------------|-----------------|
| **A1** Steps completed (multi) | Suy từ câu 1 + câu 2; checklist onboarding |
| **A2** First stuck step | Câu 2 |
| **A3** AI wait acceptable (1–5) + comment | User nói “chậm/nhanh”; không có → `Unknown` / comment trống |
| **B1** Most useful part | Câu 1 |
| **B2** AI edit effort (1–5) | Suy từ “phải sửa nhiều/ít”; không rõ → `Unknown` |
| **B3** WTP / pricing | Chỉ nếu user nói; không → `Unknown` |
| **C1** Most confusing | Câu 2 hoặc 3 |
| **C2** Error message + URL | Quote + URL từ user/owner |
| **C3** Device | Hỏi tuỳ chọn hoặc `Unknown` |
| **D1** Feature request next week | Câu 3 nếu mang tính feature |

### Template normalized (sau chuẩn hóa)

```yaml
id: NORM-20260531-001
raw_id: RAW-20260531-001
source: manual_chat
cohort: cohort-1

# A — Flow
steps_completed: [signup, board, content, breakdown, remix]  # or Unknown partial list
first_stuck_step: "remix 5 biến thể — chờ lâu"
ai_wait_score: Unknown          # 1-5 or Unknown
ai_wait_comment: "khoảng 2 phút breakdown OK"

# B — Value
most_useful: breakdown
ai_edit_score: 3                # 1-5 or Unknown
pricing_wtp: Unknown

# C — UX / bug
most_confusing: Unknown
error_report: "Không parse JSON remix" 
error_url: "https://vietnamese-eden-mvp.vercel.app/remix/..."
device: mobile

# D — Open
feature_request: "Auto đăng TikTok"

# Quotes (bắt buộc giữ ≥1 nếu có)
verbatim_quotes:
  - "Remix hay nhưng chờ hơi lâu lần đầu"

# Triage draft (xem §6)
primary_category: AI quality issue   # from feedback-triage §2
priority: P2
reproduced: Unknown
```

---

## 5. Prompt cho Hermes / ChatGPT phân tích feedback

Dán **raw verbatim** + **normalized draft** (nếu owner đã điền sơ). Không gửi secret.

### System / instruction

```
Bạn là analyst feedback cho beta Vietnamese Eden (AI content workspace tiếng Việt).
Nhiệm vụ: chuẩn hóa tin nhắn user thành YAML normalized (schema manual-feedback-intake §4).

QUY TẮC BẮT BUỘC:
- KHÔNG bịa fact: thiếu thông tin → ghi Unknown.
- GIỮ nguyên verbatim_quotes: trích đúng câu user (tiếng Việt), tối đa 3 quote.
- KHÔNG đoán email, device, URL nếu user không nói.
- Phân biệt: bug (tái hiện được) vs UX confusion vs feature request vs AI quality vs pricing.
- Output: YAML block + bảng markdown 5 dòng (category, priority, cần Linear?, cần reply user?, open questions).

Schema onboarding bắt buộc user thử: signup → board → paste text → breakdown → remix ≥5 → calendar.
Production URL: https://vietnamese-eden-mvp.vercel.app/
```

### User message (template)

```
## Raw feedback

[Paste RAW block §3]

## Owner notes (optional)

- Screenshot: ...
- Owner đã thử reproduce: Yes/No/Not tried

Hãy output:
1) YAML normalized đầy đủ
2) primary_category (1 trong: P0 blocker, P1 bug, P2 polish, UX confusion, Feature request, Pricing objection, AI quality issue)
3) priority P0|P1|P2|none
4) suggested_linear_title (1 dòng)
5) draft_reply_user (tiếng Việt, 2-4 câu, không hứa feature chưa có)
```

### Output mong đợi

Hermes/ChatGPT **không** tạo Linear thay owner — chỉ draft. Owner review rồi paste vào Linear (§8).

---

## 6. Mapping sang feedback-triage.md

| Bước | Doc | Hành động |
|------|-----|-----------|
| 1 | **manual-feedback-intake** (doc này) | Lưu RAW → NORM |
| 2 | [feedback-triage.md](./feedback-triage.md) §1 | Tái hiện trên production |
| 3 | [feedback-triage.md](./feedback-triage.md) §2 | Gán **1 primary category** |
| 4 | [feedback-triage.md](./feedback-triage.md) §3 | Priority matrix |
| 5 | [feedback-triage.md](./feedback-triage.md) §4 | Linear issue nếu cần code |
| 6 | [feedback-triage.md](./feedback-triage.md) §5 | Trả lời user |

### Category → hành động (tóm tắt)

| Category | Linear? | SLA reply |
|----------|---------|-----------|
| P0 blocker | **Yes** ngay | 4h |
| P1 bug | **Yes** | 24h |
| P2 polish | Tuỳ impact | 24–48h |
| UX confusion | Thường doc/copy; Linear nếu nhiều user | 24h |
| Feature request | Backlog (FR:) | Cảm ơn + không hứa |
| Pricing objection | Insights only | Ghi cohort report |
| AI quality | Linear nếu lặp lại; tag `ai-quality` | 24h |

---

## 7. Quy tắc integrity (không bịa)

| Rule | Chi tiết |
|------|----------|
| **Unknown** | Mọi field form không có trong tin user → `Unknown`, không điền số 1–5 giả |
| **Quotes** | Luôn giữ ≥1 `verbatim_quotes` khi user có câu mang tính đánh giá / lỗi |
| **Không suy diễn WTP** | Chỉ ghi pricing nếu user nói rõ số tiền / “đắt/rẻ” |
| **Bug vs confusion** | Chưa reproduce → `reproduced: Unknown`, không gán P0 |
| **AI quality** | Cần ví dụ input/output nếu claim “AI sai” — thiếu thì ghi trong open questions |
| **Secrets** | Không paste password, API key, full session token vào RAW/NORM/Linear |

---

## 8. Tạo Linear issue từ feedback

Team: **Alexgpt**. Dùng template đầy đủ trong [feedback-triage.md](./feedback-triage.md) §4.

### Checklist trước khi tạo issue

- [ ] RAW đã lưu + NORM YAML review bởi owner  
- [ ] Đã thử reproduce 1 lần (hoặc ghi `Not tried`)  
- [ ] Category + priority khớp [feedback-triage.md](./feedback-triage.md) §2–3  
- [ ] Title có prefix: `P0:` / `P1:` / `P2:` / `UX:` / `AI:` / `FR:`  
- [ ] Labels: `beta-feedback`, `cohort-1`, `manual-intake` (+ `ai-quality` / `mobile` nếu có)  
- [ ] Link RAW id trong description (`RAW-20260531-001`)  
- [ ] **Feedback verbatim** block quote từ user  
- [ ] Không có secret trong body issue  

### Title ví dụ

| Feedback user | Linear title |
|---------------|--------------|
| Remix lỗi JSON 5 biến thể | `P1: Remix 5 variants JSON parse fail (Xiaomi)` |
| Không thấy nút remix | `UX: User cannot find remix entry after breakdown` |
| Muốn auto-post TikTok | `FR: Auto-post to TikTok from calendar` |
| Hook AI không tự nhiên | `AI: Breakdown hook tone too generic (beauty niche)` |

### Sau khi tạo

1. Reply user (mẫu [feedback-triage.md](./feedback-triage.md) §5).  
2. Cập nhật cohort tracker / ALE-90 metrics.  
3. Nếu **không** cần code (pricing insight, praise only) → **không** tạo Linear; lưu NORM vào sheet insights.

---

## 9. Luồng tóm tắt

```
User chat (3 câu)
    → RAW block lưu verbatim
    → Hermes/ChatGPT → NORM YAML (Unknown nếu thiếu)
    → Owner review + reproduce
    → feedback-triage category/priority
    → Linear (nếu cần) + reply user
```

---

## 10. Liên kết nhanh

| Doc | Khi nào đọc |
|-----|-------------|
| [beta-invite-message.md](./beta-invite-message.md) §1 | Tin mời đã có 3 câu gợi ý — đồng bộ với §2 doc này |
| [beta-feedback-plan.md](./beta-feedback-plan.md) §5 | Schema form đầy đủ (10 câu) |
| [feedback-triage.md](./feedback-triage.md) | Triage + Linear template |
| [known-limitations.md](./known-limitations.md) | Trả lời user về giới hạn beta |
