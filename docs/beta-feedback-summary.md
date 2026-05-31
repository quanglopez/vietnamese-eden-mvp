# Beta Feedback Summary — Round 1

**Date:** 2026-05-31  
**Source:** Google Sheet (5 responses)  
**Status:** ⚠️ **Hoãn mở rộng beta**

---

## TL;DR — 30 giây

- **5 user** gửi feedback, chỉ **1 hoàn thành** partial flow, 2 audit-only.
- **Voice Profile** là điểm đau lớn nhất: mất dữ liệu khi refresh + lỗi 500.
- **AI Breakdown + Remix** được đánh giá tốt (4-4.5/5) nhưng chỉ 2 user chấm.
- **Pricing hợp lý:** 99k-299k solo, 299k-799k agency.
- **Chưa nên mở rộng** cho đến khi Voice Profile stable.

---

## Key Metrics (5 responses)

| | Value |
|--|-------|
| Completed flow | 1/5 (Partial) |
| Audit/No test | 2/5 |
| Unknown | 2/5 |
| AI Breakdown avg | 4.25/5 (n=2) |
| Remix avg | 4.00/5 (n=2) |
| Voice Profile avg | 3.25/5 (n=2) |
| Calendar avg | 3.50/5 (n=2) |

---

## Top 3 Problems (>=2 users)

1. **Voice Profile thiếu guidance** — 3/5 user không biết cần nhập bao nhiêu ký tự, không có ví dụ mẫu.
2. **AI không có progress indicator** — 2/5 user tưởng lỗi khi đợi 90s và refresh làm mất dữ liệu.
3. **Calendar không rõ là internal scheduling** — 2/5 user tưởng có auto-post.

---

## Top 3 Strengths

1. **Board + Content add rất dễ** — <30s, không cần đọc hướng dẫn.
2. **AI Breakdown nắm hook/angle/CTA tốt** — tiếng Việt tự nhiên.
3. **Core workflow đúng pain point** — creator/agency VN cần.

---

## Pricing Signals

| Segment | Range |
|---------|-------|
| Solo creator | 99k – 299k/tháng |
| Freelancer | 99k – 199k/tháng |
| Agency (2-3 người) | 299k – 799k/tháng |
| Free tier request | 2/5 user đề xuất free giới hạn |

---

## Immediate Actions (Sprint)

| # | Action | Priority | Owner | ETA |
|---|--------|----------|-------|-----|
| 1 | Add progress bar + input preservation for Voice Profile | P0 | Frontend | ASAP |
| 2 | Fix POST /api/voice-profile 500 error | P1 | Backend | ASAP |
| 3 | Add Voice Profile onboarding (min 500 chars + examples) | P1 | Frontend | 1-2d |
| 4 | Add AI progress indicators across all long tasks | P1 | Frontend | 2-3d |
| 5 | Clarify Calendar is manual post + add monthly view | P1 | Frontend | 2-3d |

---

## Beta Readiness Score: 4/10

| Area | Score |
|------|-------|
| Board/Content | 8/10 |
| AI Breakdown | 7/10 |
| Remix | 7/10 |
| Voice Profile | 2/10 |
| Calendar | 4/10 |
| Landing Page | 5/10 |

---

## When to Expand Beta?

**Chỉ khi:**
- >=3 users hoàn thành full flow **không gặp bug Voice Profile**
- Voice Profile 500 error rate <5%
- Có progress indicator cho mọi AI task >3s

**Target:** Sau khi fix P0 + P1 trên, test lại với cohort nhỏ (3-5 người) trước khi mở rộng.

---

**Full analysis:** [beta-feedback-round-1.md](./beta-feedback-round-1.md)
