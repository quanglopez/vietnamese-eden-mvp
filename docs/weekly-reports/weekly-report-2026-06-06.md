# Báo Cáo Beta Tuần 1 — Vietnamese Eden MVP

**Thời gian:** 2026-05-30 → 2026-06-06 (7 ngày)
**Cohort:** 2
**Owner:** Quang Lopez
**Ngày xuất báo cáo:** 2026-06-06
**Template gốc:** [weekly-beta-report-template.md](./weekly-beta-report-template.md)
**Issue:** [ALE-186](https://linear.app/alexgpt/issue/ALE-186)

---

## Tóm tắt nhanh

| Metric | Value | Confidence |
|--------|-------|------------|
| Reporting period | 2026-05-30 → 2026-06-06 | High |
| **Activation funnel size** | 5 analytics users, 1 power user | **Low** — n=5 |
| Signups (period) | 4 | High |
| Logins (period) | 55 (1 distinct user) | High |
| Core flow completion | 1/5 (20%) | Low |
| Day-1 return rate | 100% (1/1) | **Insufficient data** — n=1 |
| Day-7 return rate | **Cannot measure** — only 3 calendar days of data | N/A |
| beta_testers table | 0 rows | High — empty |
| feedback_entries | 1 entry (P1 bug) | High |
| **Nudge events** | **ENUM not applied to production DB** | **N/A** |
| WTP signals | 0 | High — no data |
| Personas | 0 (beta_testers empty) | High — no data |

**Gate verdict:** **WAITING** — multiple criteria lack data (see §8)

---

## 1. Nguồn dữ liệu

| Dữ liệu | Nguồn | Confidence |
|---------|-------|------------|
| Auth users | `auth.users` | High — direct SQL |
| Analytics events | `analytics_events` | High — direct SQL |
| Workspace data | `workspaces` / `boards` / `content_items` / etc. | High — direct SQL |
| Feedback entries | `feedback_entries` | High — direct SQL |
| beta_testers | `beta_testers` | **High — 0 rows** (table exists but empty) |
| Linear issues | Linear team Alexgpt | N/A — not queried in this report (manual) |
| Raw feedback (Telegram/Zalo) | Manual intake | Unknown — no entries this period |

**Source timestamps:** All SQL queries executed 2026-06-06 via MCP Supabase read-only access.

---

## 2. Chỉ Số Kích Hoạt (Activation Metrics)

### Funnel overview

| Step | Unique users | Total events | % of signup | Note |
|------|-------------|-------------|-------------|------|
| signup | 4 | 4 | 100% | All 4 in last 7 days |
| login | 1 | 55 | 25% | Only 1 distinct user (power user) |
| board_create | 1 | 2 | 25% | Power user only |
| content_add | 1 | 3 | 25% | Power user only |
| breakdown_run | 1 | 4 | 25% | Power user only |
| remix_run | 1 | 2 | 25% | Power user only |
| calendar_add | 1 | 1 | 25% | Power user only |

### Funnel trực quan

```
Signup     ████████████ 4  (100%)
Login      ██            1  (25% — same user)
Board      ██            1  (25%)
Content    ██            1  (25%)
Breakdown  ██            1  (25%)
Remix      ██            1  (25%)
Calendar   ██            1  (25%)
```

### Conversion rates (within analytics_events)

| Conversion | Numerator | Denominator | Rate |
|------------|-----------|-------------|------|
| Signup → Board | 1 | 4 | 25% |
| Board → Content | 1 | 1 | 100% |
| Content → Breakdown | 1 | 1 | 100% |
| Breakdown → Remix | 1 | 1 | 100% |
| Remix → Calendar | 1 | 1 | 100% |

### Auth events (platform-wide, last 7 days)

| Event | Count | Distinct users |
|-------|-------|---------------|
| signup | 4 | 4 |
| login | 55 | 1 |

**Observation:** 4 unique signups but only 1 distinct login user. The other 3 signed up but never logged in. This is the same **signup-to-login gap** flagged in [baseline-retention-measurement.md §4.3](./baseline-retention-measurement.md).

### Workspace stats (cumulative, all time)

| Metric | Count |
|--------|-------|
| Total auth users | 26 |
| Total workspaces | 15 |
| Total boards | 15 |
| Total content items | 31 |
| Completed analyses | 13 |
| Generated outputs | 106 |
| Calendar items | 9 |

**Observation:** Workspace tables show real product usage (15 boards, 31 content items, 13 analyses, 106 outputs) but most activity is from the power user and pre-dates the analytics_events instrumentation.

### Phân bổ Persona

| Persona | Số tester | Tỷ lệ | Hoàn thành core flow |
|---------|-----------|-------|---------------------|
| Creator | 0 | 0% | 0/0 |
| Agency | 0 | 0% | 0/0 |
| Beauty / Lifestyle | 0 | 0% | 0/0 |
| Educator / Coach | 0 | 0% | 0/0 |
| Khác | 0 | 0% | 0/0 |
| **Không xác định** | 5 | 100% | 1/5 (20%) |
| **Tổng** | **5** | **100%** | **1/5 (20%)** |

**Note:** All 5 analytics users are categorized as "Không xác định" (unattributed) because `beta_testers` table is empty — no persona linkage exists.

---

## 3. Mẫu Phản Hồi (Feedback Patterns)

### Tổng quan

| Category | Last 7d | Cumulative | Trend |
|----------|---------|-----------|-------|
| Bug (P0/P1/P2) | 1 (P1) | 1 | N/A (first report) |
| UX confusion | 0 | 0 | N/A |
| Feature request (fr) | 0 | 0 | N/A |
| AI quality | 0 | 0 | N/A |
| Pricing/WTP (price) | 0 | 0 | N/A |
| Positive | 0 | 0 | N/A |
| **Total** | **1** | **1** | — |

### Top patterns tuần này

| # | Pattern | Số user | Category | Priority | Mô tả ngắn | Action |
|---|---------|---------|----------|----------|-------------|--------|
| 1 | Slow login (5s) | 1 | bug | P1 | "Login quá chậm, mất 5 giây mới vào được dashboard." | **Backlog — needs triage** (reproducible: Unknown) |

### Positive signals đáng chú ý

| # | Quote (verbatim) | User (anonymized) | Persona | Category insight |
|---|-------------------|--------------------|---------|-------------------|
| — | Chưa có data | — | — | — |

**Observation:** Only 1 feedback entry exists. Beta program is in very early stage. Most tester activity has not yet been captured in `feedback_entries` table.

---

## 4. Top Bugs & Risks

### P0/P1 bugs mở

| # | Linear | Title | Priority | Status | Mô tả | Assignee |
|---|--------|-------|----------|--------|-------|----------|
| 1 | **Untriaged** | Slow login (5s) | P1 (assumed) | Untriaged | "Login quá chậm, mất 5 giây mới vào được dashboard." (tester, 2026-06-05) | **Owner** |

**Reproducible:** Unknown — needs owner verification.

### P2/P3 bugs mở

| # | Linear | Title | Category | Status |
|---|--------|-------|----------|--------|
| — | Chưa có data | — | — | — |

### Risks / Watch items

| # | Risk | Severity | Probability | Mitigation |
|---|------|----------|-------------|------------|
| 1 | **ENUM migration not applied to production** | High | High | `nudge_shown` and `nudge_clicked` event types are in TypeScript code (PR #33) but not in production Postgres ENUM. Cannot track nudge effectiveness until migration runs. |
| 2 | **Sample size too small for retention metrics** | Medium | High | Only 1 user with login events. Day-1 = 1/1 = 100% (n=1, meaningless). Day-7 = cannot measure. |
| 3 | **Signup-to-login gap** | Medium | Confirmed | 4 signups but only 1 distinct login user. 3 signups never returned. |
| 4 | **beta_testers table empty** | Medium | Confirmed | Cohort tracking is not populated. No persona data for analytics. |
| 5 | **No nudge event data** | Low | High | Until ENUM migration applies, no nudge_shown/nudge_clicked events can be inserted. |

---

## 5. WTP Signals (Willingness to Pay)

**Chưa có data** — 0 feedback entries with WTP signal this period.

| # | User (anonymized) | Persona | WTP signal | Giá đề cập | Ghi chú |
|---|--------------------|---------|-----------|-----------|---------|
| — | Chưa có data | — | — | — | — |

### WTP tóm tắt

| WTP bucket | Số tester | Tỷ lệ |
|------------|-----------|-------|
| Yes (sẽ trả) | 0 | 0% |
| Maybe (cần cải thiện trước) | 0 | 0% |
| No (không đáng) | 0 | 0% |
| Chưa hỏi | 5 | 100% |

---

## 6. Nudge Metrics (ALE-183 / ALE-185)

**Status:** **ENUM migration not applied to production database.**

| Metric | Value | Note |
|--------|-------|------|
| nudge_shown events | **N/A** | ENUM does not have `nudge_shown` value in production Postgres |
| nudge_clicked events | **N/A** | ENUM does not have `nudge_clicked` value in production Postgres |
| Period start | 2026-06-06 (PR #33 merged) | Component deployed but cannot track |
| Component live | Yes (`/dashboard` for returning users) | Visible to user, no telemetry |

**Root cause:** The migration file `supabase/migrations/add-nudge-analytics-events.sql` was committed to repo (PR #33) but **was never applied to production Supabase** via `supabase db push` or SQL editor.

**Impact:**
- Users see the ContinueWhereYouLeftOff nudge on dashboard
- `trackEvent("nudge_shown", ...)` calls fail silently in production (server action swallows errors)
- No way to measure nudge effectiveness (shown rate, click rate, CTA distribution)

**Recommended fix (not in scope for ALE-186):**
1. Apply migration: `ALTER TYPE analytics_event_type ADD VALUE 'nudge_shown'`, `ALTER TYPE analytics_event_type ADD VALUE 'nudge_clicked'`
2. Verify with: `SELECT unnest(enum_range(NULL::analytics_event_type));`
3. Re-deploy production (Vercel should pick up any new type generation if needed)
4. Re-measure nudge metrics in next weekly report

---

## 7. Retention Baseline (ALE-187)

**Source:** [baseline-retention-measurement.md](./baseline-retention-measurement.md)

| Metric | Value | Re-measure date |
|--------|-------|----------------|
| Total analytics users | 5 | 2026-06-10 (for Day-1) |
| Users with login events | 1 | — |
| Day-1 return rate | 100% (1/1) — **insufficient data** | 2026-06-10 |
| Day-7 return rate | **Cannot measure** (3-day window) | 2026-06-13 |
| Active users (3+ days) | 1 | — |
| One-time users (1 event) | 4 | — |
| Core funnel completion | 20% (1/5) | — |

**Status:** Baseline cannot be established with current data. Re-measurement scheduled in `baseline-retention-measurement.md §7`.

---

## 8. Decision Gate

| Criterion | Target | Actual | Status |
|-----------|--------|--------|--------|
| Completed full flow | ≥5 testers | 1 | ❌ |
| P0 bugs open | 0 | 0 | ✅ |
| P1 bugs open | ≤2 | 1 (untriaged) | ⬜ — untriaged, not confirmed |
| No regression on R1 fixes | All hold | — | N/A |
| WTP positive signals | ≥3 testers | 0 | ❌ |
| Feedback response rate | ≥60% | N/A | ⬜ — no tester correspondence logged |
| Day-1 retention measurable | yes | no (n=1) | ❌ |
| Day-7 retention measurable | yes | no (3-day window) | ❌ |
| Nudge events tracked | yes | **no (ENUM not applied)** | ❌ |
| beta_testers populated | yes | 0 rows | ❌ |

**Gate verdict: WAITING**

**Rationale:**
- Not GO: 7 of 10 criteria unmet
- Not NO-GO: P0/P1 bug count is low, core product is working (1 user completed full funnel), no schema/data disasters
- WAITING: Need ≥7 days of additional data + ENUM migration applied + beta_testers populated + at least 1 WTP conversation

**Owner decision required before M14 scope.**

---

## 9. Hành Động Tiếp Theo (Next Actions)

### Urgent (tuần này)

1. [ ] **Owner: Apply ENUM migration to production Supabase**
   - File: `supabase/migrations/add-nudge-analytics-events.sql`
   - Run via SQL editor or `supabase db push`
   - Verify: `SELECT unnest(enum_range(NULL::analytics_event_type));`
2. [ ] **Owner: Triage feedback entry ID 25d036ab** (P1 slow login)
   - Verify reproducible: Yes / No / Unknown
   - If reproducible: Create Linear issue, link to feedback_entry
   - If not reproducible: Mark as `closed` with note
3. [ ] **Owner: Populate beta_testers table**
   - Source: Google Sheet with Cohort 2 list (per project-status feedback source)
   - Insert via `/admin/beta-testers` UI or direct SQL
4. [ ] **Owner: Decide on slow-login bug priority** (P1 vs P3)
   - 5s login is a UX issue, not a P0 unless it blocks production

### Sprint backlog (next 7 days)

1. [ ] Re-measure Day-1 retention after Jun 10 (per baseline-retention-measurement.md §7)
2. [ ] Send 1 WTP question to power user (tester-01) — manual follow-up per ALE-182 §6
3. [ ] Add 3-day reminder to power user if no login by Jun 9 (per ALE-182 §6)
4. [ ] Investigate signup-to-login gap (3 users signed up but never returned)

### Docs/onboarding updates

1. [ ] Add "What to expect week 1" section to tester onboarding guide
2. [ ] Update project-status.md to reflect M13 progress (ALE-186 done)

### Follow-up tester

1. [ ] tester-01 (power user): ask WTP question, request 1 more week of usage data
2. [ ] tester-02/03/04 (signup-only): manual email asking if they encountered issues (template in ALE-182 §6)
3. [ ] tester-05: not yet contacted

---

## 10. Product Learnings

### Những gì hoạt động tốt

| # | Feature/flow | Signal | Ghi chú |
|---|-------------|--------|---------|
| 1 | Full funnel (board → content → breakdown → remix → calendar) | 1/5 users (20%) completed all 6 steps | Power user case study: created 2 boards, 3 content items, 2 analyses, 2 remix variants, 1 calendar entry |
| 2 | Auth + signup | 4 signups in 7 days | All 4 from new sources (not existing users) |
| 3 | Workspace creation | 15 workspaces across 26 users (58%) | Most users created workspace but few progressed |

### Những gì cần cải thiện

| # | Feature/flow | Signal | Ghi chú |
|---|-------------|--------|---------|
| 1 | Login performance | 1 feedback: "5 giây" (P1) | Could be Supabase cold start or auth callback latency |
| 2 | Signup-to-return | 3/4 signups never returned (75%) | Likely auth flow friction or onboarding gap |
| 3 | Persona tracking | 0/5 users have persona | beta_testers table not populated — admin UI needed |
| 4 | Nudge telemetry | Cannot track nudge CTR | ENUM migration not applied — needs deployment |

### Feature requests đáng chú ý

| # | Request | Số tester hỏi | Category | Priority đề xuất |
|---|---------|-------------|----------|------------------|
| — | Chưa có data | 0 | FR | Backlog |

---

## 11. Integrity & Guardrails

| # | Rule | Status |
|---|------|--------|
| 1 | Mọi số liệu phải trace được về Supabase query hoặc feedback entry cụ thể | ✅ All numbers sourced from real SQL queries documented above |
| 2 | WTP chỉ ghi nếu user nói rõ. Thiếu → `Chưa có data` | ✅ WTP section marked "Chưa có data" |
| 3 | Quote phải verbatim (giữ nguyên tiếng Việt, emoji, typo) | ✅ Feedback quote preserved verbatim |
| 4 | Bug phải tái hiện hoặc ghi `reproduced: Unknown`. Không gán P0 nếu chưa tái hiện | ✅ Slow-login bug marked as "P1 (assumed)" with "Reproducible: Unknown" |
| 5 | Feature request = backlog, không cam kết thời gian | ✅ No FRs this period |
| 6 | Privacy: anonymize user (tester-XX), không paste email/password/API key | ✅ No PII included; only anonymized tester counts |
| 7 | Không gửi automated email/Telegram trừ khi owner rõ ràng request và scope | ✅ All follow-up marked as "manual" (per ALE-182 §6) |
| 8 | Báo cáo là manual workflow — owner review trước khi share | ✅ This report requires owner review before sharing |

---

## 12. So sánh với baseline retention (cross-reference)

| Source | Date range | Sample | Day-1 | Day-7 |
|--------|-----------|--------|-------|-------|
| [baseline-retention-measurement.md](./baseline-retention-measurement.md) | 2026-06-03 → 2026-06-05 (3 days) | 1 login user | 100% (insufficient data) | Cannot measure |
| This report (ALE-186) | 2026-05-30 → 2026-06-06 (7 days) | 1 login user | 100% (insufficient data) | **Cannot measure** (longer window, but only 1 user) |

**Trend:** No change in retention signal (sample too small).

---

## 13. Decision needed from Owner

Before M14 scoping, owner must decide:

1. **Apply ENUM migration?** (Yes — required for any nudge measurement)
2. **Populate beta_testers?** (Yes — required for persona analytics)
3. **Triage P1 slow-login bug?** (Yes — 1 untriaged entry)
4. **Manually reach out to 4 signup-only users?** (Optional — for retention data)
5. **Gate verdict override?** (WAITING is data-driven; if owner wants GO for M14, document reason)

---

*Report generated 2026-06-06 by Hermes Autopilot (model: minimax-m3 via Ollama Cloud)*
*All data from production Supabase read-only SQL queries*
*No app code changes, no migration applied, no automation*
*Issue: [ALE-186](https://linear.app/alexgpt/issue/ALE-186)*
