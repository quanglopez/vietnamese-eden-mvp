# Baseline Retention Measurement — Vietnamese Eden MVP

**Cập nhật:** 2026-06-06 (ALE-187)
**Issue:** [ALE-187](https://linear.app/alexgpt/issue/ALE-187/m13-baseline-retention-measurement)
**Milestone:** M13 — Retention & Iteration
**Loại:** Docs-only + read-only Supabase SQL queries. Không app code, không migration.
**Data source:** Supabase production `analytics_events` + `auth.users` + workspace tables, queried 2026-06-06

---

## 1. Tóm tắt

| Metric | Value | Confidence |
|--------|-------|------------|
| **Date range** | 2026-06-03 → 2026-06-05 (3 calendar days) | — |
| **Total auth users** | 26 | High (source: `auth.users`) |
| **Total analytics users** | 5 (with events) | High |
| **Users with login events** | 1 | Low — see §3 |
| **Day-1 return rate** | **Insufficient data** — only 1 user has login events; Day-1 = 1/1 (100%) but statistically meaningless | **Low** |
| **Day-7 return rate** | **Cannot measure** — data range is 3 days, insufficient for 7-day window | **N/A** |
| **Active users (any event)** | 1 (power user: 67 events, 3 active days, full funnel) | Low |
| **One-time users** | 4 (signup-only, 0 login events, 1 event each) | Medium |
| **Core funnel completion** | 1 user out of 5 (20%) completed signup → board → content → breakdown → remix → calendar | Low (n=5) |

**Verdict:** Baseline retention metrics cannot be meaningfully established with current data. Sample size is too small (5 analytics users, 1 with login events) and the observation window is only 3 days. This document serves as a **pre-baseline snapshot** — real Day-1 and Day-7 metrics require ≥7 days of data with ≥10 active users.

---

## 2. Data Collection Method

All metrics were collected via **read-only Supabase SQL queries** against the production database. No app code changes, no migrations, no destructive operations.

### 2.1 SQL queries used

```sql
-- 1. Event volume by type
SELECT event_type, COUNT(*) as count
FROM analytics_events
GROUP BY event_type ORDER BY count DESC;

-- 2. Total unique users + date range
SELECT COUNT(DISTINCT user_id) as total_users,
       MIN(created_at) as earliest_event,
       MAX(created_at) as latest_event
FROM analytics_events;

-- 3. Day-1 return rate (from retention-nudges-v1.md §8.3)
WITH first_login AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM analytics_events WHERE event_type = 'login' GROUP BY user_id
),
day1_return AS (
  SELECT COUNT(DISTINCT fl.user_id) AS returned
  FROM first_login fl
  JOIN analytics_events ae ON ae.user_id = fl.user_id
    AND ae.event_type = 'login'
    AND ae.created_at BETWEEN fl.first_at + INTERVAL '1 day'
                           AND fl.first_at + INTERVAL '2 days'
)
SELECT (SELECT COUNT(*) FROM first_login) AS total_users_with_login,
       (SELECT returned FROM day1_return) AS day1_returned,
       ROUND((SELECT returned FROM day1_return)::numeric /
             NULLIF((SELECT COUNT(*) FROM first_login), 0) * 100, 1) AS day1_return_pct;

-- 4. Signup-to-activation funnel
SELECT event_type, COUNT(DISTINCT user_id) as distinct_users
FROM analytics_events GROUP BY event_type ORDER BY distinct_users DESC;

-- 5. Per-user activity timeline
SELECT user_id, active_days, first_event, last_event, days_between
FROM (SELECT user_id,
  COUNT(DISTINCT DATE(created_at)) as active_days,
  MIN(created_at) as first_event, MAX(created_at) as last_event,
  EXTRACT(DAY FROM (MAX(created_at) - MIN(created_at))) as days_between
FROM analytics_events GROUP BY user_id) sub
ORDER BY active_days DESC;

-- 6. Auth users, workspaces, content stats
SELECT (SELECT COUNT(*) FROM auth.users) as total_auth_users,
       (SELECT COUNT(*) FROM workspaces) as total_workspaces,
       (SELECT COUNT(*) FROM boards) as total_boards,
       (SELECT COUNT(*) FROM content_items) as total_content_items,
       (SELECT COUNT(*) FROM content_analyses WHERE status = 'completed') as total_completed_analyses,
       (SELECT COUNT(*) FROM generated_outputs) as total_outputs,
       (SELECT COUNT(*) FROM content_calendar_items) as total_calendar_items;
```

### 2.2 Data platform

- **Supabase project:** `romaiooigximznlrpsze` (production)
- **Query tool:** MCP Supabase `execute_sql` (read-only, no DDL/DML)
- **Execution date:** 2026-06-06
- **All queries are idempotent and non-destructive**

---

## 3. Findings

### 3.1 Event summary

| Event type | Total events | Distinct users |
|------------|-------------|---------------|
| login | 55 | 1 |
| signup | 4 | 4 |
| breakdown_run | 4 | 1 |
| content_add | 3 | 1 |
| remix_run | 2 | 1 |
| board_create | 2 | 1 |
| calendar_add | 1 | 1 |
| **Total** | **71** | **5** |

**Key observation:** Only 1 user has `login` events (55 total). 4 users have only `signup` events (1 event each). This suggests that the `login` event tracking may not be firing for all users, or that 4 users signed up but never returned to trigger a login event. The signup-vs-login gap is a known data quality issue — see §4.

### 3.2 Per-user activity

| User | Signup | Login | First event | Last event | Active days | Total events | Event types | Days between |
|------|--------|-------|-------------|-----------|-------------|-------------|-------------|-------------|
| User A (power) | — | ✅ (55) | Jun 3 | Jun 5 | 3 | 67 | 6 | 2 |
| User B | ✅ | — | Jun 5 | Jun 5 | 1 | 1 | 1 | 0 |
| User C | ✅ | — | Jun 5 | Jun 5 | 1 | 1 | 1 | 0 |
| User D | ✅ | — | Jun 4 | Jun 4 | 1 | 1 | 1 | 0 |
| User E | ✅ | — | Jun 5 | Jun 5 | 1 | 1 | 0 |

- **1 power user** (User A): completed full funnel (board → content → breakdown → remix → calendar) across 3 days
- **4 one-time users**: signup-only, no login, no workspace activity recorded in analytics_events

### 3.3 Content creation stats (from workspace tables)

| Metric | Count |
|--------|-------|
| Auth users | 26 |
| Workspaces | 15 |
| Boards | 15 |
| Content items | 31 |
| Completed analyses | 13 |
| Generated outputs | 106 |
| Calendar items | 9 |

These workspace stats show real usage exists (15 boards, 31 content items, 13 analyses), but most activity isn't captured in `analytics_events` — likely because the power user did most workspace actions before analytics was instrumented (M10, ALE-167), and later users haven't progressed past signup.

### 3.4 Day-1 return rate

**Result:** 1/1 = 100%

**Assessment:** Statistically meaningless. Only 1 user has login events. This user logged in across 3 consecutive days (Jun 3-5), so Day-1 return = 100% trivially. With n=1, the confidence interval is enormous (95% CI: 2.5%–100%). This metric should be re-measured when ≥10 users have login events over ≥7 days.

### 3.5 Day-7 return rate

**Result:** Cannot measure.

The data range is 2026-06-03 to 2026-06-05 (3 calendar days). No user has a 7-day observation window. Day-7 return rate requires at least 8 days of data (first event + 7 days) for any meaningful calculation.

**Earliest possible Day-7 measurement:** 2026-06-10 (7 days after the first event on Jun 3).

---

## 4. Known Limitations

| # | Limitation | Impact | Mitigation |
|---|------------|--------|------------|
| 1 | **Sample size too small** (5 analytics users, 1 with login) | Day-1/Day-7 return rates are statistically meaningless | Wait for ≥10 active users with login events before re-measuring |
| 2 | **Observation window too short** (3 days) | Day-7 return cannot be calculated | Re-measure after ≥7 days from first signup (earliest: Jun 10) |
| 3 | **Signup↔login gap** (4 signup-only users, 0 login events) | Likely auth tracking issue — signup fires but login event may not fire on reuse, or these users never returned after signup | Investigate `trackEvent('login', ...)` call path; may need session-based login tracking fix |
| 4 | **beta_testers table empty** | 0 rows in `beta_testers` — cohort/persona tracking not yet populated from admin UI | Beta tester data is managed in Google Sheets; Supabase table exists but may not have been seeded. Check admin UI at `/admin/beta-testers`. |
| 5 | **workspace_id = null for auth events** | `signup` and `login` events have `workspace_id = null` by design (Option A from ALE-167). This is correct but means auth events must be queried separately from workspace events. | Use platform-wide queries for retention, workspace-scoped queries for funnel. Current SQL in §2.1 accounts for this. |
| 6 | **No nudge_shown / nudge_clicked events yet** | ALE-184 (Continue-where-you-left-off) shipped without analytics event instrumentation. We cannot measure nudge CTA click rate. | ALE-188 or follow-up should add `nudge_shown` and `nudge_clicked` event types. |
| 7 | **Single workspace dominates** (1 power user with 67 events) | All funnel and cohort metrics are inflated by this single user. Median-based metrics would be 1 event/user. | Report both mean and median; flag when n < 10. |

---

## 5. Baseline Metrics Summary Table

| Metric | Value | Sample size | Confidence | Re-measure after |
|--------|-------|-------------|------------|-------------------|
| Total auth users | 26 | — | High | — |
| Users with analytics events | 5 | — | High | — |
| Users with login events | 1 | n=1 | **Low** | ≥10 login users |
| Day-1 return rate | 100% (1/1) | n=1 | **Low** | ≥10 login users, ≥7 days |
| Day-7 return rate | **N/A** | — | **N/A** | Need ≥8 days of data |
| Active users (≥3 active days) | 1 | — | Low | — |
| One-time users (1 event only) | 4 | — | Medium | — |
| Core funnel completion rate | 20% (1/5) | n=5 | **Low** | ≥10 workspace users |
| Boards per workspace | 1 (15 boards / 15 workspaces) | n=15 | Medium | — |
| Content items per board (avg) | 2.07 (31/15) | n=15 | Medium | — |
| Completed analyses / content items | 42% (13/31) | n=31 | Medium | — |
| Generated outputs / analysis | 8.15 (106/13) | n=13 | Medium | — |
| Calendar items / outputs | 8.5% (9/106) | n=106 | Medium | — |

---

## 6. Recommendations for ALE-186 (First Weekly Beta Report)

1. **Do not report Day-1 or Day-7 return rates** in the first weekly report if sample remains n < 10. Instead report:
   - "Retention baseline not yet established — n < 10 active users with login events"
   - Auth user count (26), workspace user count (5), power user count (1)

2. **Report workspace funnel metrics** (board → content → breakdown → remix → calendar) from workspace tables, which have more data than analytics_events:
   - 15 boards, 31 content items, 13 analyses, 106 outputs, 9 calendar items
   - These represent real product usage across the workspace

3. **Flag the signup↔login gap (§4.3)** as a P1 investigation item. 4 users signed up with zero subsequent login events. Either:
   - Auth callback doesn't fire `trackEvent('login', ...)` on return visits, or
   - These users genuinely never returned (which itself is a retention signal)

4. **Schedule Day-7 re-measurement** for 2026-06-10 or later. Until then, the Day-7 column in the weekly report should read "Pending (insufficient data window)".

5. **Add `nudge_shown` and `nudge_clicked` event types** in a future ALE so ALE-184's "Tiếp tục từ lần trước" can be measured. Without these events, we can only measure overall return rate, not nudge-specific lift.

---

## 7. SQL Re-measurement Guide

Re-run these queries after **2026-06-10** (7 full days after first event) and again after **2026-06-17** (14 days) to establish proper Day-1 and Day-7 baselines.

```sql
-- Re-measure Day-1 return rate (run after June 10)
WITH first_login AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM analytics_events
  WHERE event_type = 'login'
  GROUP BY user_id
),
day1_return AS (
  SELECT COUNT(DISTINCT fl.user_id) AS returned
  FROM first_login fl
  JOIN analytics_events ae
    ON ae.user_id = fl.user_id
    AND ae.event_type = 'login'
    AND ae.created_at BETWEEN fl.first_at + INTERVAL '1 day'
                           AND fl.first_at + INTERVAL '2 days'
)
SELECT
  (SELECT COUNT(*) FROM first_login) AS total_users_with_login,
  (SELECT returned FROM day1_return) AS day1_returned,
  ROUND((SELECT returned FROM day1_return)::numeric /
        NULLIF((SELECT COUNT(*) FROM first_login), 0) * 100, 1) AS day1_return_pct;

-- Re-measure Day-7 return rate (run after June 17)
WITH first_login AS (
  SELECT user_id, MIN(created_at) AS first_at
  FROM analytics_events
  WHERE event_type = 'login'
  GROUP BY user_id
),
day7_return AS (
  SELECT COUNT(DISTINCT fl.user_id) AS returned
  FROM first_login fl
  JOIN analytics_events ae
    ON ae.user_id = fl.user_id
    AND ae.event_type = 'login'
    AND ae.created_at BETWEEN fl.first_at + INTERVAL '6 days'
                           AND fl.first_at + INTERVAL '8 days'
)
SELECT
  (SELECT COUNT(*) FROM first_login) AS total_users_with_login,
  (SELECT returned FROM day7_return) AS day7_returned,
  ROUND((SELECT returned FROM day7_return)::numeric /
        NULLIF((SELECT COUNT(*) FROM first_login), 0) * 100, 1) AS day7_return_pct;
```

---

## 8. Guardrails Status

| # | Guardrail | Status |
|---|-----------|--------|
| 1 | No migration | ✅ Held — no schema changes |
| 2 | No schema change | ✅ Held — read-only SQL queries |
| 3 | No payment change | ✅ Held — no payment code touched |
| 4 | No automated email/Telegram/Zalo | ✅ Held — docs-only |
| 5 | No scheduled jobs | ✅ Held — no cron, no server code |
| 6 | No secrets | ✅ Held — used existing Supabase MCP access |
| 7 | No destructive SQL | ✅ Held — all queries are SELECT only |
| 8 | Missing data marked Unknown | ✅ Held — Day-1 = "insufficient data", Day-7 = "cannot measure", sample sizes flagged |

---

*Document generated 2026-06-06 by Hermes Autopilot. All data queried via read-only Supabase SQL. No app code changes. No migrations. No automation. Issue: [ALE-187](https://linear.app/alexgpt/issue/ALE-187/m13-baseline-retention-measurement)*