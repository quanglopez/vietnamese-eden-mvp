# Weekly Beta Report Template — Vietnamese Eden MVP

**Dành cho:** Owner / workspace admin
**Mục đích:** Tổng hợp hằng tuần activation, feedback, bug, WTP signal và next actions cho closed beta
**Cadence:** Mỗi tuần một lần, hoặc sau 7 ngày active cohort
**Scope:** Manual report only — không gửi email/Telegram tự động

---

## Cách dùng

1. Copy template bên dưới vào Google Docs, Notion, Linear document hoặc một file weekly riêng.
2. Chọn khoảng thời gian báo cáo: `YYYY-MM-DD → YYYY-MM-DD`.
3. Lấy activation metrics từ `/admin/analytics`, `/admin/beta-launch`, `analytics_events`, và checklist/support tracker nếu cần.
4. Lấy feedback từ `/admin/feedback`, Google Sheet feedback source of truth, và các NORM entry trong docs feedback.
5. Giữ nguyên field `Unknown` khi thiếu dữ liệu. Không đoán số liệu, WTP, bug severity hoặc user intent.
6. Owner review report trước khi tạo Linear issue mới hoặc gửi follow-up cho tester.

**Không làm trong ALE-181:** không automated email, không Telegram bot, không scheduled job, không migration, không schema change.

---

## Data Sources

| Nguồn | Dùng cho | Ghi chú |
|-------|----------|---------|
| `/admin/analytics` | Activation funnel, event counts, cohort/persona split | Ưu tiên số liệu app đã instrument |
| `/admin/beta-launch` | Launch overview, tester readiness, support status | Dùng để đối chiếu cohort/support notes |
| `/admin/feedback` | Feedback entries, candidate issue drafts | Không auto-create Linear issue nếu chưa owner approve |
| Google Sheet feedback source of truth | Raw tester responses, manual notes, WTP | Nguồn tổng hợp thủ công |
| `docs/beta-feedback-workflow.md` | Category, priority, NORM format, triage rules | Không triage từ raw text alone |
| `docs/beta-support-checklist.md` | Per-tester onboarding/support progress | Dùng khi analytics thiếu link user/tester |
| Linear | Existing bugs, duplicates, follow-up issue status | Search duplicate trước khi tạo issue |

---

## Manual Data Pull Checklist

| Step | Việc cần làm | Output |
|------|--------------|--------|
| 1 | Chọn tuần báo cáo | `start_date`, `end_date` |
| 2 | Export hoặc đọc activation funnel | Counts theo step |
| 3 | Đếm tester theo trạng thái onboarding | Invited / Account / Active / Completed / Dropped |
| 4 | Review feedback mới trong tuần | Danh sách category + priority |
| 5 | Group feedback patterns | Pattern + count + trend |
| 6 | Search Linear duplicate/related issues | Link ALE-XXX hoặc `New candidate` |
| 7 | Ghi WTP signals verbatim | Amount / maybe / objection / Unknown |
| 8 | Chốt next actions | Owner action, Hermes action, Claude review nếu có code |

---

# Weekly Beta Report — YYYY-MM-DD → YYYY-MM-DD

## 1. Tóm tắt điều hành

| Field | Value |
|-------|-------|
| **Tuần báo cáo** | YYYY-MM-DD → YYYY-MM-DD |
| **Cohort** | cohort-2 / cohort-3 / mixed / Unknown |
| **Report owner** | Owner name |
| **Source confidence** | High / Medium / Low |
| **Gate verdict** | GO / WAIT / NO-GO |
| **One-line summary** | ... |

### Điểm chính trong tuần

1. **Activation:** ...
2. **Feedback pattern lớn nhất:** ...
3. **Bug/risk lớn nhất:** ...
4. **WTP signal:** ...
5. **Next action quan trọng nhất:** ...

---

## 2. Activation Metrics

### Funnel overview

| Step | Event / Source | This week | Cohort total | Conversion vs previous step | Notes |
|------|----------------|-----------|--------------|-----------------------------|-------|
| Invited | beta tester tracker | N | N | — | |
| Account created | beta tester tracker / auth | N | N | N% | |
| Login / active | analytics_events / support notes | N | N | N% | |
| Board created | `board_created` | N | N | N% | |
| Content added | `content_added` | N | N | N% | |
| AI Breakdown run | `breakdown_run` | N | N | N% | |
| Remix created | `remix_created` | N | N | N% | |
| Calendar item added | `calendar_added` | N | N | N% | |
| Feedback submitted | `/admin/feedback` / sheet | N | N | N% | |
| Full flow completed | support checklist | N | N | N% | |

### Segment notes

| Segment | Active testers | Completed flow | Biggest drop-off | Notes |
|---------|----------------|----------------|------------------|-------|
| Creator | N | N | ... | |
| Freelancer | N | N | ... | |
| Agency | N | N | ... | |
| Audit-only | N | N | ... | |
| Không xác định | N | N | ... | |

### Activation interpretation

- **Best signal:** ...
- **Main friction:** ...
- **Data limitation:** ...
- **Suggested activation action:** ...

---

## 3. Feedback Patterns

### Feedback volume

| Metric | This week | Cohort total | Notes |
|--------|-----------|--------------|-------|
| New feedback entries | N | N | |
| Normalized NORM entries | N | N | |
| Bug reports | N | N | |
| UX confusion | N | N | |
| Feature requests | N | N | |
| AI quality feedback | N | N | |
| Pricing / WTP feedback | N | N | |
| Positive signals | N | N | |

### Patterns to watch

| Pattern | Category | Count this week | Count total | Trend | Severity | Evidence |
|---------|----------|----------------|-------------|-------|----------|----------|
| Example: Không hiểu bước tiếp theo sau Breakdown | `ux` | N | N | ↑ / ↓ / = / NEW | P2 | NORM-YYYYMMDD-NNN |
| Example: Output AI chưa đúng giọng | `ai` | N | N | ↑ / ↓ / = / NEW | P2 | NORM-YYYYMMDD-NNN |
| Example: Remix fail | `bug` | N | N | ↑ / ↓ / = / NEW | P1 | ALE-XXX / NORM-... |

### Representative quotes

> Paste short verbatim quote here. Keep Vietnamese wording, emoji and typos. Do not include secrets.

> Paste second quote if useful.

---

## 4. Top Bugs & Risks

| Rank | Issue / Candidate | Priority | Affected users | Status | Owner | Next step |
|------|-------------------|----------|----------------|--------|-------|-----------|
| 1 | ALE-XXX / New candidate | P0/P1/P2/P3 | N | Open / Done / Needs repro | Hermes / Owner | ... |
| 2 | ALE-XXX / New candidate | P0/P1/P2/P3 | N | Open / Done / Needs repro | Hermes / Owner | ... |
| 3 | ALE-XXX / New candidate | P0/P1/P2/P3 | N | Open / Done / Needs repro | Hermes / Owner | ... |

### Regression check

| Regression area | Expected | Observed | Status |
|-----------------|----------|----------|--------|
| CJK leakage | No Chinese/Japanese leakage | Unknown / None / Seen | ✅ / ⚠️ / ❌ |
| Generic titles | Titles specific and useful | Unknown / Pass / Fail | ✅ / ⚠️ / ❌ |
| Google OAuth hidden | Email/password only if intended | Unknown / Pass / Fail | ✅ / ⚠️ / ❌ |
| Breakdown reliability | Core flow works | Unknown / Pass / Fail | ✅ / ⚠️ / ❌ |
| Remix reliability | Core flow works | Unknown / Pass / Fail | ✅ / ⚠️ / ❌ |
| Calendar reliability | Calendar add works | Unknown / Pass / Fail | ✅ / ⚠️ / ❌ |

### Risk notes

- **P0/P1 risk:** ...
- **Support risk:** ...
- **Data quality risk:** ...
- **Decision impact:** ...

---

## 5. WTP Signals

**Rule:** Chỉ ghi WTP khi tester nói rõ về giá, ngân sách, willingness-to-pay, hoặc buying intent. Không suy đoán từ positive feedback.

| User / Segment | Signal type | Amount | Verbatim / Summary | Confidence | Follow-up |
|----------------|-------------|--------|--------------------|------------|-----------|
| Anonymized user | Yes / Maybe / No / Objection / Unknown | VND/month | "..." | High / Medium / Low | ... |
| Creator | Maybe | Unknown | "..." | Medium | Ask pricing follow-up |

### Pricing interpretation

- **Strongest positive WTP:** ...
- **Top objection:** ...
- **Price range mentioned:** ...
- **Follow-up question for next week:** ...

---

## 6. Product Learnings

| Learning | Evidence | Confidence | Product implication |
|----------|----------|------------|---------------------|
| ... | NORM-... / analytics count | High / Medium / Low | ... |
| ... | Quote / event drop-off | High / Medium / Low | ... |

### What worked

- ...

### What confused users

- ...

### What users asked for

- ...

---

## 7. Next Actions

### This week / urgent

| Action | Owner | Type | Due | Success check |
|--------|-------|------|-----|---------------|
| ... | Owner / Hermes | Support / Bug / UX / Docs / Research | YYYY-MM-DD | ... |

### Sprint backlog candidates

| Candidate | Priority | Evidence | Duplicate check | Owner approval |
|-----------|----------|----------|-----------------|----------------|
| P1: ... | P1 | N users / NORM links | ALE-XXX / None found | ☐ |
| P2: ... | P2 | N users / quote | ALE-XXX / None found | ☐ |

### Follow-up messages to send manually

| Tester / Segment | Reason | Template | Owner sent? |
|------------------|--------|----------|-------------|
| ... | Invite >48h no account | beta-invite-message.md §3 | ☐ |
| ... | Breakdown done, no feedback | beta-invite-message.md §4 | ☐ |

**Reminder:** Không gửi automated email/Telegram từ report này. Owner gửi thủ công cho tới khi automation được scoped riêng.

---

## 8. Decision Gate

| Criterion | Target | Actual | Status | Notes |
|-----------|--------|--------|--------|-------|
| Completed full flow | ≥5 testers | N | ⬜ / ✅ / ❌ | |
| P0 bugs | 0 | N | ⬜ / ✅ / ❌ | |
| P1 bugs | ≤2 active | N | ⬜ / ✅ / ❌ | |
| No regression on fixed R1 issues | All hold | Unknown / Pass / Fail | ⬜ / ✅ / ❌ | |
| Feedback quality sufficient | ≥5 useful entries | N | ⬜ / ✅ / ❌ | |
| WTP learning captured | ≥1 explicit signal or objection | N | ⬜ / ✅ / ❌ | |

**Gate verdict:** GO / WAIT / NO-GO

**Rationale:** ...

**Owner decision needed:** ...

---

## 9. Integrity & Guardrails

| Guardrail | Status | Notes |
|-----------|--------|-------|
| No automated email/Telegram | ✅ / ❌ | |
| No migration | ✅ / ❌ | |
| No schema change | ✅ / ❌ | |
| No payment change | ✅ / ❌ | |
| No secrets in report | ✅ / ❌ | |
| Raw feedback normalized before triage | ✅ / ❌ | |
| Linear duplicate search done before new issue | ✅ / ❌ | |
| Owner approved new issue candidates | ✅ / ❌ | |

---

## 10. Hermes Generation Prompt

Use this when asking Hermes to draft a weekly report from available DB/admin data. Owner must review before publishing.

```markdown
Generate a Weekly Beta Report for Vietnamese Eden MVP for date range YYYY-MM-DD → YYYY-MM-DD.

Use:
- /admin/analytics activation metrics
- /admin/beta-launch launch/tester readiness data
- /admin/feedback entries
- Google Sheet/manual support notes if provided by owner
- Linear issue search for duplicate/related bugs

Output must follow docs/weekly-beta-report-template.md.

Rules:
- Use Vietnamese section headers.
- Do not fabricate missing values; write Unknown.
- Keep WTP only when explicitly mentioned.
- Keep user quotes short and verbatim.
- Do not create Linear issues automatically.
- Do not send email/Telegram automatically.
- Highlight next actions and owner decisions.
```

---

## 11. Related Docs

| Doc | Dùng khi |
|-----|----------|
| [project-status.md](./project-status.md) | Current project state, active issue, milestone status |
| [beta-feedback-workflow.md](./beta-feedback-workflow.md) | Normalize and classify feedback |
| [feedback-triage.md](./feedback-triage.md) | Decide priority/action and create Linear templates |
| [manual-feedback-intake.md](./manual-feedback-intake.md) | Convert chat/manual feedback into RAW/NORM entries |
| [beta-support-checklist.md](./beta-support-checklist.md) | Per-tester progress and support notes |
| [beta-tester-onboarding-guide.md](./beta-tester-onboarding-guide.md) | Tester-facing onboarding guide |
| [beta-invite-message.md](./beta-invite-message.md) | Manual invite/follow-up message templates |
