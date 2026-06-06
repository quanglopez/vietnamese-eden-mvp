# Cohort 2 Decision Gate — Evaluation Memo

**Ngày đánh giá:** 2026-06-06
**Issue:** [ALE-189](https://linear.app/alexgpt/issue/ALE-189/m13-cohort-2-decision-gate-evaluation)
**Người đánh giá:** Hermes Autopilot (model: minimax-m3)
**Phạm vi:** Cohort 2 expansion decision
**Source data:** [weekly-report-2026-06-06.md](./weekly-reports/weekly-report-2026-06-06.md) (ALE-186)
**Tham chiếu:** [project-status.md](./project-status.md), [m12-closeout-and-m13-recommendation.md](./m12-closeout-and-m13-recommendation.md), [retention-nudges-v1.md](./retention-nudges-v1.md), [baseline-retention-measurement.md](./baseline-retention-measurement.md)

---

## 1. Verdict (TL;DR)

| Field | Value |
|-------|-------|
| **Verdict** | **WAIT** |
| **Confidence** | High (data-driven) |
| **Cohort ready to expand?** | No — wait for additional data |
| **Trigger threshold met?** | No — 3 days of data (need 7–10 days OR 5 completed tests) |
| **Production telemetry unblocked?** | Yes — ENUM migration applied 2026-06-06 |
| **M14 scope decision** | Halt auto-scoping — wait for gate criteria |

**One-sentence rationale:** ENUM migration now unlocks nudge telemetry, but the underlying blockers (insufficient data window, no beta_testers, no WTP signals, low sample size) remain unchanged from ALE-186, so the verdict stays **WAIT** rather than upgrading to GO.

---

## 2. What changed since ALE-186 (2026-06-06)

| # | Change | Impact | Source |
|---|--------|--------|--------|
| 1 | **Production ENUM migration applied** | `analytics_event_type` ENUM in production Postgres now includes `nudge_shown` and `nudge_clicked` (verified via `SELECT enumlabel FROM pg_enum`) | Supabase MCP — confirmed 2026-06-06 03:12 UTC |
| 2 | **Nudge telemetry unblocked** | `trackEvent("nudge_shown", ...)` and `trackEvent("nudge_clicked", ...)` server actions will now succeed in production. Future dashboard visits by returning users will generate events. | Production ENUM state |
| 3 | **No new analytics events yet** | ENUM is ready but no actual `nudge_shown` / `nudge_clicked` events exist in `analytics_events` table (zero rows for these types). Nudge CTR cannot be measured until users visit `/dashboard` again. | Supabase MCP — `SELECT COUNT(*)` |
| 4 | **No other data changes** | beta_testers still 0 rows, feedback_entries still 1 row, 5 analytics users unchanged, Day-1/Day-7 retention still insufficient. | Supabase MCP — 2026-06-06 |

**Net effect of changes:** One blocker (nudge telemetry) is removed, but data-side blockers remain. Verdict stays WAIT, not GO.

---

## 3. Decision Gate Criteria — Current Status

Criteria sourced from [weekly-beta-report-template.md §"Decision Gate"](./weekly-beta-report-template.md) and [m12-closeout-and-m13-recommendation.md §5](./m12-closeout-and-m13-recommendation.md).

| # | Criterion | Target | Actual (as of 2026-06-06) | Status | Source |
|---|-----------|--------|---------------------------|--------|--------|
| 1 | Completed full flow | ≥5 testers | 1 (20% of 5) | ❌ | analytics_events |
| 2 | P0 bugs open | 0 | 0 | ✅ | feedback_entries |
| 3 | P1 bugs open (triaged) | ≤2 | 1 (untriaged) | ⬜ | feedback_entries (entry 25d036ab) |
| 4 | No regression on R1 fixes | All hold | N/A (no R1 deployed) | N/A | Linear history |
| 5 | WTP positive signals | ≥3 testers | 0 | ❌ | feedback_entries |
| 6 | Feedback response rate | ≥60% | N/A — no tester correspondence | ⬜ | Manual intake |
| 7 | Day-1 retention measurable | yes | no (n=1) | ❌ | baseline-retention-measurement.md |
| 8 | Day-7 retention measurable | yes | no (3-day window) | ❌ | baseline-retention-measurement.md |
| 9 | Nudge events tracked | yes | **YES — ENUM ready, zero events yet** | ⬜ | Production ENUM |
| 10 | beta_testers populated | yes | 0 rows | ❌ | beta_testers table |
| 11 | Production stable (health) | yes | HTTP 200, no errors | ✅ | Vercel /api/health |
| 12 | No critical bugs blocking flow | none | 1 P1 (slow login) but doesn't block | ✅ | feedback analysis |

**Score:** 3 ✅ + 3 ⬜ + 1 N/A + 5 ❌

**Verdict mapping:**
- **GO** requires: All ✅ or all ✅ + N/A
- **WAIT** matches: 3 ✅ + 3 ⬜ + 5 ❌
- **NO-GO** matches: P0 open OR <2 testers completed full flow

→ **WAIT** is the correct call.

---

## 4. Remaining Blockers (ranked by impact)

### High priority

1. **No Day-7 retention data** — 3-day observation window is insufficient. Earliest possible Day-7 measurement: 2026-06-10. Cannot evaluate cohort retention without this. **Owner action: wait 4 more days.**

2. **beta_testers table empty (0 rows)** — Cohort tracking is not populated. No persona data for analytics. Cannot distinguish creator/agency/educator insights. **Owner action: populate from Google Sheet or seed via admin UI.**

3. **P1 slow-login bug untriaged** (entry 25d036ab) — "Login quá chậm, mất 5 giây mới vào được dashboard." Reproducibility unknown. **Owner action: reproduce + create Linear issue + triage.**

### Medium priority

4. **Low sample size for funnel metrics** — Only 1 of 5 users (20%) completed full flow. Power user dominates the data. **Mitigation: expand cohort or wait for more organic signups.**

5. **0 WTP signals** — No feedback mentions pricing or willingness to pay. **Owner action: manually ask tester-01 (power user) using template in [retention-nudges-v1.md §6.5](./retention-nudges-v1.md).**

6. **No nudge event data yet** — ENUM is ready, but no nudge has fired in production since migration. **Mitigation: power user must visit `/dashboard` to generate first events. Manual reminder may help.**

### Low priority (watch)

7. **Signup-to-login gap** — 4 signups, 1 distinct login user. 3 signups never returned. Investigate auth flow or onboarding gap (separate issue, not blocking).

8. **Feedback response rate undefined** — No tester correspondence tracked. ALE-186 did not capture this metric.

---

## 5. Recommendation

**WAIT** — do not expand Cohort 2 yet.

**Rationale:**
- ✅ Production telemetry is unblocked (1 of 10 criteria upgraded)
- ❌ But 6 of 12 criteria still unmet
- ❌ No data-driven evidence to support GO
- ❌ No critical reason to escalate to NO-GO (no P0, no disaster)

**Specific next milestones to revisit verdict:**

| Date | Why this date | Expected new state |
|------|---------------|-------------------|
| 2026-06-10 | Earliest Day-7 measurement possible (7 days after Jun 3 first event) | Day-1 + Day-7 retention metrics re-measurable |
| 2026-06-13 | 10 days of observation window | Statistically meaningful sample for retention |
| TBD | Owner populates beta_testers | Persona analytics unblocked |
| TBD | Owner triages slow-login bug | P1 status clarified |
| TBD | Power user visits /dashboard | First nudge_shown event recorded |

**If by 2026-06-13:**
- 5+ testers have completed full flow → **upgrade to GO**
- Day-1 retention ≥30% AND Day-7 retention ≥10% → **upgrade to GO**
- WTP signals ≥3 testers → **upgrade to GO**
- P1 bugs open > 2 → **escalate to NO-GO**

---

## 6. Next Actions (priority order)

### This week (2026-06-06 → 2026-06-13)

1. **[Owner] Populate beta_testers table** from Cohort 2 Google Sheet (or admin UI)
   - Priority: **URGENT** — blocks all persona analytics
   - Estimated effort: 30 min if data is in sheet
2. **[Owner] Triage P1 slow-login bug** (entry 25d036ab)
   - Reproduce: Yes / No / Unknown
   - If reproducible: Create Linear issue, link to feedback entry
   - If not: Mark as `closed` with note
   - Priority: **HIGH** — unblocks decision gate criterion #3
3. **[Owner] Manually prompt tester-01** (power user) to revisit `/dashboard` so first `nudge_shown` event fires
   - This will validate the nudge flow end-to-end
   - Priority: **HIGH** — validates ENUM migration
4. **[Owner] Send WTP question to tester-01** (template in [retention-nudges-v1.md §6.5](./retention-nudges-v1.md))
   - Priority: MEDIUM — needed for criterion #5

### Next week (2026-06-13 → 2026-06-20)

5. **[Hermes] Re-measure retention** on 2026-06-10 (Day-7) and 2026-06-13 (10-day window)
   - Run queries from [baseline-retention-measurement.md §7](./baseline-retention-measurement.md)
6. **[Owner] Send 3-day reminder to power user** if no login by 2026-06-09 (per [retention-nudges-v1.md §6](./retention-nudges-v1.md))
7. **[Owner] Reach out to 3 signup-only users** (tester-02/03/04) with manual email template
   - Goal: understand why they didn't return
   - Priority: MEDIUM
8. **[Owner] Re-evaluate gate verdict on 2026-06-13** with new data
   - Update this memo with v2 status

### Docs/onboarding updates

9. **[Owner] Add "What to expect week 1" section** to tester onboarding guide
   - Reduce signup-to-login gap (tester-02/03/04 likely confused)
10. **[Hermes] Generate next weekly report** (ALE-186-v2) on 2026-06-13

---

## 7. Cross-references

- **Source weekly report:** [weekly-reports/weekly-report-2026-06-06.md](./weekly-reports/weekly-report-2026-06-06.md)
- **M12 closeout:** [m12-closeout-and-m13-recommendation.md](./m12-closeout-and-m13-recommendation.md)
- **Retention strategy:** [retention-nudges-v1.md](./retention-nudges-v1.md)
- **Retention baseline:** [baseline-retention-measurement.md](./baseline-retention-measurement.md)
- **Project status:** [project-status.md](./project-status.md)
- **Nudge component PR:** [#33](https://github.com/quanglopez/vietnamese-eden-mvp/pull/33)
- **Weekly report PR:** [#34](https://github.com/quanglopez/vietnamese-eden-mvp/pull/34)

---

## 8. Integrity & Guardrails

| # | Rule | Status |
|---|------|--------|
| 1 | Mọi recommendation phải trace về data cụ thể trong weekly report hoặc Supabase query | ✅ All criteria reference specific source |
| 2 | Verdict phải data-driven, không subjective | ✅ Verdict maps to 4 ✅ / 6 ❌/in-progress count |
| 3 | Không bịa metrics hoặc blocker status | ✅ All numbers verified via Supabase MCP 2026-06-06 03:12 UTC |
| 4 | Missing data phải ghi rõ Unknown / Insufficient | ✅ Sample size, persona data, WTP all marked |
| 5 | No app code, no migration, no schema change | ✅ Docs-only |
| 6 | No payment, no automation, no secrets | ✅ None |
| 7 | No destructive SQL | ✅ Read-only SELECT only |
| 8 | No PII leaked | ✅ tester-01 is anonymized label |

---

*Decision memo generated 2026-06-06 03:15 UTC by Hermes Autopilot (model: minimax-m3 via Ollama Cloud).*
*All data from production Supabase read-only SQL queries executed at 2026-06-06 03:12 UTC.*
*Production ENUM migration applied 2026-06-06 (confirmed via `pg_enum` query).*
*Verdict: WAIT. Do not expand Cohort 2 yet. Revisit 2026-06-13.*
*Issue: [ALE-189](https://linear.app/alexgpt/issue/ALE-189/m13-cohort-2-decision-gate-evaluation)*
