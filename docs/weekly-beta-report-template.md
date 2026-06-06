# Báo cáo Beta Hàng Tuần — Vietnamese Eden MVP

**Mục đích:** Template báo cáo tuần cho owner — tổng hợp data từ Supabase + admin + feedback, không tự động gửi.
**Owner:** Quang Lopez
**Chu kỳ:** Hàng tuần (thứ Hai, hoặc sau 7 ngày hoạt động cohort)
**Phạm vi:** Chỉ Cohort 2+ (Cohort 1 đã đóng). Không bao gồm automation, email, hoặc Telegram — mọi báo cáo là owner review + copy-paste thủ công.

Tài liệu liên quan:
- [beta-feedback-workflow.md](./beta-feedback-workflow.md) — Quy trình chuẩn hóa feedback
- [beta-support-checklist.md](./beta-support-checklist.md) — Checklist onboarding từng tester
- [feedback-triage.md](./feedback-triage.md) — Triage + Linear template
- [manual-feedback-intake.md](./manual-feedback-intake.md) — Manual intake từ chat
- [beta-feedback-round-2.md](./beta-feedback-round-2.md) — Cohort 2 tracker (live)
- [project-status.md](./project-status.md) — Source of truth dự án

---

## 1. Nguồn dữ liệu

| Dữ liệu | Nguồn | Cách truy cập |
|---------|-------|---------------|
| **Số lượng tester** | `beta_testers` table | `/admin/beta-testers` hoặc Supabase SQL |
| **Trạng thái invite** | `beta_testers.invite_status` | `/admin/beta-testers` |
| **Trạng thái signup** | `beta_testers.signup_status` | `/admin/beta-testers` |
| **Core flow progress** | `analytics_events` (board_create, content_add, breakdown_run, remix_run, calendar_add) | `/admin/analytics` → Cohort tab, hoặc SQL |
| **Auth events** | `analytics_events` (signup, login) | SQL — workspace_id=null, platform-wide |
| **Persona phân bổ** | `beta_testers.persona` | `/admin/beta-testers` |
| **Feedback entries** | `feedback_entries` table | `/admin/feedback` |
| **Linear issues mới** | Linear team Alexgpt | Linear API hoặc manual |
| **Feedback thô** | Google Sheet, Telegram, Zalo | [manual-feedback-intake.md](./manual-feedback-intake.md) |

### Supabase SQL — Data pull checklist

Sử dụng SQL queries dưới đây trong Supabase Dashboard → SQL Editor. Thay `YYYY-MM-DD` bằng ngày bắt đầu tuần báo cáo.

```sql
-- 1. Tổng tester theo trạng thái
SELECT invite_status, signup_status, core_flow_status, COUNT(*)
FROM beta_testers
GROUP BY 1, 2, 3
ORDER BY 1, 2, 3;

-- 2. Activation funnel (7 ngày gần nhất)
SELECT event_type, COUNT(DISTINCT user_id) AS unique_users, COUNT(*) AS total_events
FROM analytics_events
WHERE created_at >= 'YYYY-MM-DD'
GROUP BY event_type
ORDER BY event_type;

-- 3. Persona phân bổ
SELECT persona, COUNT(*)
FROM beta_testers
WHERE invite_status IN ('invited', 'accepted')
GROUP BY persona;

-- 4. Feedback theo category + priority (7 ngày gần nhất)
SELECT category, priority, COUNT(*)
FROM feedback_entries
WHERE created_at >= 'YYYY-MM-DD'
GROUP BY category, priority
ORDER BY category, priority;

-- 5. Auth events (platform-wide, 7 ngày gần nhất)
SELECT event_type, COUNT(*)
FROM analytics_events
WHERE event_type IN ('signup', 'login')
  AND created_at >= 'YYYY-MM-DD'
GROUP BY event_type;
```

---

## 2. Checklist Data Pull thủ công

Chạy checklist này trước khi điền báo cáo. Mỗi bước ghi lại số liệu.

| # | Bước | Nguồn | Ghi chú |
|---|------|-------|---------|
| 1 | Đếm tổng tester đã mời (invite_status ≠ pending) | `/admin/beta-testers` hoặc SQL #1 | — |
| 2 | Đếm tester đã signup (signup_status = signed_up hoặc onboarded) | `/admin/beta-testers` hoặc SQL #1 | — |
| 3 | Đếm tester completed core flow (core_flow_status = completed) | `/admin/beta-testers` hoặc SQL #1 | — |
| 4 | Activation funnel: signup → board → content → breakdown → remix → calendar | `/admin/analytics` Cohort tab hoặc SQL #2 | Core 5 bước |
| 5 | Auth funnel: signup + login (platform-wide) | SQL #5 | workspace_id=null, không gán persona |
| 6 | Persona phân bổ | `/admin/beta-testers` hoặc SQL #3 | — |
| 7 | Feedback mới tuần này (từ /admin/feedback) | `/admin/feedback` hoặc SQL #4 | Đếm theo category + priority |
| 8 | Tổng feedback Cohort 2 đến nay | `/admin/feedback` | Cumulative |
| 9 | Linear issues mới/tuần | Linear team Alexgpt | Chỉ issues có label `beta-feedback` |
| 10 | P0/P1 bugs mở (hoặc close tuần này) | Linear | Filterseverity |

---

## 3. Template Báo Cáo Tuần

Copy template dưới, điền số liệu từ checklist §2. Ghi dưới dạng section trong `beta-feedback-round-2.md` hoặc file riêng `weekly-report-YYYY-MM-DD.md`.

```markdown
# Báo Cáo Beta Tuần — Tuần [N]
**Thời gian:** YYYY-MM-DD → YYYY-MM-DD
**Cohort:** 2
**Owner:** [tên]

---

## Chỉ Số Kích Hoạt (Activation Metrics)

| Metric | Tuần này | Tổng cohort | Ghi chú |
|--------|----------|-------------|---------|
| Tester đã mời | N | N | — |
| Tester đã signup | N | N | — |
| Tester đã onboard (5/5 checklist) | N | N | — |
| Tester completed core flow | N | N | board → content → breakdown → remix → calendar |
| Signup → Board conversion | N% | — | signup có board / tổng signup |
| Board → Breakdown conversion | N% | — | board có breakdown / tổng board |
| Breakdown → Remix conversion | N% | — | breakdown có remix / tổng breakdown |
| Remix → Calendar conversion | N% | — | remix có calendar / tổng remix |
| Platform logins (7d) | N | N | Không gán persona (workspace_id=null) |
| New signups (7d) | N | N | — |

### Funnel trực quan

```
Invited    ████ N
Signed up  ███  N  (N%)
Board      ███  N  (N%)
Breakdown  ██   N  (N%)
Remix      █    N  (N%)
Calendar   █    N  (N%)
```

### Phân bổ Persona

| Persona | Số tester | Tỷ lệ | Hoàn thành core flow |
|---------|-----------|-------|---------------------|
| Creator | N | N% | N/N |
| Agency | N | N% | N/N |
| Beauty / Lifestyle | N | N% | N/N |
| Educator / Coach | N | N% | N/N |
| Khác | N | N% | N/N |
| Không xác định | N | N% | N/N |

---

## Mẫu Phản Hồi (Feedback Patterns)

### Tổng quan

| Category | Số entry tuần này | Tổng đến nay | Xu hướng |
|----------|-------------------|-------------|----------|
| Bug (P0/P1/P2) | N | N | ↑ / ↓ / = |
| UX confusion | N | N | ↑ / ↓ / = |
| Feature request | N | N | ↑ / ↓ / = |
| AI quality | N | N | ↑ / ↓ / = |
| Pricing/WTP | N | N | ↑ / ↓ / = |
| Positive | N | N | ↑ / ↓ / = |

### Top patterns tuần này

| # | Pattern | Số user | Category | Priority | Mô tả ngắn | Action |
|---|---------|---------|----------|----------|-------------|--------|
| 1 | [Tên pattern] | N | bug/ux/fr/ai | P1/P2/P3 | 1 câu mô tả | ALE-XXX hoặc backlog |
| 2 | ... | N | ... | ... | ... | ... |
| 3 | ... | N | ... | ... | ... | ... |

*(Thêm dòng đến 5 nếu cần. Priority matrix theo feedback-triage.md §3.)*

### Positive signals đáng chú ý

| # | Quote (verbatim) | User (anonymized) | Persona | Category insight |
|---|-------------------|--------------------|---------|-------------------|
| 1 | "" | tester-XX | Creator | "Breakdown hay, đúng ý mình" |
| 2 | ... | ... | ... | ... |

---

## Top Bugs & Risks

### P0/P1 bugs mở

| # | Linear | Title | Priority | Status | Mô tả | Assignee |
|---|--------|-------|----------|--------|-------|----------|
| 1 | ALE-XXX | ... | P0/P1 | In Progress / Open | 1 câu | ... |
| 2 | ... | ... | ... | ... | ... | ... |

*(Nếu không có P0/P1 → ghi "Không có P0/P1 bugs mở".)*

### P2/P3 bugs mở

| # | Linear | Title | Category | Status |
|---|--------|-------|----------|--------|
| 1 | ALE-XXX | ... | P2 | Backlog |
| 2 | ... | ... | ... | ... |

### Risks / Watch items

| # | Risk | Severity | Probability | Mitigation |
|---|------|----------|-------------|------------|
| 1 | ... | High/Med/Low | High/Med/Low | ... |
| 2 | ... | ... | ... | ... |

---

## WTP Signals (Willingness to Pay)

**Quy tắc:** Chỉ ghi WTP nếu user nói rõ số tiền hoặc "đáng/không đáng" giá. Không suy diễn từ vắng mặt. Thiếu → ghi `Chưa có data`.

| # | User (anonymized) | Persona | WTP signal | Giá đề cập | Ghi chú |
|---|--------------------|---------|-----------|-----------|---------|
| 1 | tester-XX | Creator | Yes / No / Maybe | 200k VND/tháng | "Đáng nếu remix ổn hơn" |
| 2 | ... | ... | ... | ... | ... |

### WTP tóm tắt

| WTP bucket | Số tester | Tỷ lệ |
|------------|-----------|-------|
| Yes (sẽ trả) | N | N% |
| Maybe (cần cải thiện trước) | N | N% |
| No (không đáng) | N | N% |
| Chưa hỏi | N | N% |

---

## Product Learnings

### Những gì hoạt động tốt

| # | Feature/flow | Signal | Ghi chú |
|---|-------------|--------|---------|
| 1 | Breakdown | "Hay, đúng ý mình" (N testers) | Tester thích output tiếng Việt tự nhiên |
| 2 | ... | ... | ... |

### Những gì cần cải thiện

| # | Feature/flow | Signal | Ghi chú |
|---|-------------|--------|---------|
| 1 | Remix 5 variants | "Chờ lâu, JSON parse lỗi" (N testers) | ALE-XXX nếu có |
| 2 | ... | ... | ... |

### Feature requests đáng chú ý

| # | Request | Số tester hỏi | Category | Priority đề xuất |
|---|---------|-------------|----------|------------------|
| 1 | Auto-post TikTok | N | FR | Backlog |
| 2 | ... | ... | ... | ... |

---

## Hành Động Tiếp Theo (Next Actions)

### Urgent (tuần này)

1. [ ] [Hành động 1 — ví dụ: Fix P1 bug ALE-XXX]
2. [ ] [Hành động 2]

### Sprint backlog

1. [ ] [Hành động 3]
2. [ ] [Hành động 4]

### Docs/onboarding updates

1. [ ] [Cải thiện copy bước X]
2. [ ] [Update FAQ]

### Follow-up tester

1. [ ] [Tester XX: gửi reminder]
2. [ ] [Tester YY: hỏi thêm về WTP]

---

## Decision Gate

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Completed full flow | ≥5 testers | N | ⬜ / ✅ |
| P0 bugs open | 0 | N | ⬜ / ✅ |
| P1 bugs open | ≤2 | N | ⬜ / ✅ |
| No regression on R1 fixes | All hold | — | ⬜ / ✅ |
| WTP positive signals | ≥3 testers | N | ⬜ / ✅ |
| Feedback response rate | ≥60% | N% | ⬜ / ✅ |

**Gate verdict:** WAITING / GO / NO-GO

---

## Integrity & Guardrails

| # | Rule |
|---|------|
| 1 | Mọi số liệu phải trace được về Supabase query hoặc feedback entry cụ thể. Không bịa số. |
| 2 | WTP chỉ ghi nếu user nói rõ. Thiếu → `Chưa có data`. |
| 3 | Quote phải verbatim (giữ nguyên tiếng Việt, emoji, typo). Không chỉnh sửa. |
| 4 | Bug phải tái hiện hoặc ghi `reproduced: Unknown`. Không gán P0 nếu chưa tái hiện. |
| 5 | Feature request = backlog, không cam kết thời gian. |
| 6 | Privacy: anonymize user (tester-XX), không paste email/password/API key. |
| 7 | Không gửi automated email/Telegram trừ khi owner rõ ràng request và scope. |
| 8 | Báo cáo là manual workflow — owner review trước khi share. |

---

## Hermes Generation Prompt

Dùng prompt dưới để Hermes tự động điền số liệu từ Supabase/Linear/admin. Owner review + chỉnh sửa trước khi publish.

```
Bạn là analyst cho Vietnamese Eden MVP beta. Hãy điền Weekly Beta Report template bằng số liệu thực tế từ:
1. Supabase: beta_testers, analytics_events, feedback_entries (queries trong §1)
2. Linear: team Alexgpt, filter label beta-feedback
3. Admin dashboards: /admin/beta-testers, /admin/analytics, /admin/feedback

QUY TẮC BẮT BUỘC:
- Mọi số liệu phải trace về nguồn cụ thể (ghi nguồn: SQL query / admin page / Linear filter).
- WTP: chỉ ghi nếu user nói rõ số tiền. Thiếu → "Chưa có data".
- Quote: giữ nguyên verbatim tiếng Việt. Không chỉnh sửa.
- Bug: ghi reproduced status (Yes/No/Unknown). Không gán P0 nếu chưa reproduce.
- Feature request → backlog, không cam kết thời gian.
- Privacy: anonymize user thành tester-XX. Không paste email/password.
- Không thêm automated messaging/channels. Chủ báo cáo là manual workflow.

OUTPUT:
1. Điền mọi bảng trong template bằng số liệu.
2. Unknown/thiếu data → ghi "Chưa có data" kèm lý do.
3. Thêm nhận xét ngắn (1-2 câu) ở mỗi section nếu pattern rõ.
4. Gate verdict: chỉ ghi GO nếu tất cả criteria đạt. Nếu bất kỳ criteria thiếu data → WAITING.
```

---

## Tài liệu liên quan

| Doc | Dùng khi |
|-----|----------|
| [beta-feedback-workflow.md](./beta-feedback-workflow.md) | Quy trình intake + normalize + triage |
| [beta-support-checklist.md](./beta-support-checklist.md) | Checklist onboarding từng tester |
| [feedback-triage.md](./feedback-triage.md) | Priority matrix + Linear template |
| [manual-feedback-intake.md](./manual-feedback-intake.md) | RAW→NORM conversion từ chat |
| [beta-feedback-round-2.md](./beta-feedback-round-2.md) | Cohort 2 tracker (live) |
| [project-status.md](./project-status.md) | Current state + changelog |
| [beta-tester-onboarding-guide.md](./beta-tester-onboarding-guide.md) | Tester-facing guide |
| [known-limitations.md](./known-limitations.md) | Beta limitations reference |

---

*Template version: 1.0 — ALE-181 — Created 2026-06-06*
*Milestone: M12 — Beta Launch & Activation*
*Issue: [ALE-181](https://linear.app/alexgpt/issue/ALE-181)*