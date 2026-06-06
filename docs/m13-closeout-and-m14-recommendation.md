# M13 Closeout & M14 Recommendation

**Milestone:** M13 — Retention & Iteration
**Closeout date:** 2026-06-06
**Author:** Kiro (Hermes Autopilot)
**Status:** COMPLETE

---

## 1. M13 Status: COMPLETE

All canonical issues shipped to production. No open blockers. Decision gate verdict is WAIT (data-driven, not a milestone blocker).

### Rationale

M13's goal was *Retention & Iteration*: ship nudge component, measure retention, collect Cohort 2 data, triage P1 bugs, and evaluate expansion readiness. All of these shipped:

- Nudge component shipped (ALE-184)
- Nudge analytics events + ENUM migration shipped and applied (ALE-183/185)
- Baseline retention measured (ALE-187)
- Weekly report with real data (ALE-186)
- Cohort 2 decision gate evaluated — verdict WAIT (ALE-189)
- P1 slow-login triaged and fixed (ALE-190)

The WAIT verdict is a *data outcome*, not a milestone failure. M13 delivered the measurement infrastructure; the data simply isn't sufficient yet for a GO decision.

---

## 2. Canonical Issue Table

| Issue | Title | Type | PR | Merge SHA | Completed | Breach? |
|-------|-------|------|----|-----------|-----------|---------|
| [ALE-183](https://linear.app/alexgpt/issue/ALE-183) | Continue-where-you-left-off full spec | App code | [#33](https://github.com/quanglopez/vietnamese-eden-mvp/pull/33) | `ad77bc0` | 2026-06-06 | No |
| [ALE-184](https://linear.app/alexgpt/issue/ALE-184) | Continue nudge component | App code | [#31](https://github.com/quanglopez/vietnamese-eden-mvp/pull/31) | `cf3fe8a` | 2026-06-06 | No |
| [ALE-185](https://linear.app/alexgpt/issue/ALE-185) | Baseline retention measurement + nudge events | App code | [#33](https://github.com/quanglopez/vietnamese-eden-mvp/pull/33) | `ad77bc0` | 2026-06-06 | No |
| [ALE-186](https://linear.app/alexgpt/issue/ALE-186) | First weekly beta report | Docs | [#34](https://github.com/quanglopez/vietnamese-eden-mvp/pull/34) | `a1319a8` | 2026-06-06 | No |
| [ALE-187](https://linear.app/alexgpt/issue/ALE-187) | Day-7 retention baseline | Docs | [#32](https://github.com/quanglopez/vietnamese-eden-mvp/pull/32) | `e837b8a` | 2026-06-06 | No |
| [ALE-188](https://linear.app/alexgpt/issue/ALE-188) | *(Duplicate of ALE-186)* | — | — | — | — | — |
| [ALE-189](https://linear.app/alexgpt/issue/ALE-189) | Cohort 2 decision gate evaluation | Docs | [#35](https://github.com/quanglopez/vietnamese-eden-mvp/pull/35) | `5fc63a4` | 2026-06-06 | No |
| [ALE-190](https://linear.app/alexgpt/issue/ALE-190) | P1 slow-login fix | Infra config | [#36](https://github.com/quanglopez/vietnamese-eden-mvp/pull/36) | `f05c15c` | 2026-06-06 | No |

**Duplicate note:** ALE-188 was created as a duplicate of ALE-186 during M13 scoping. Both covered the weekly beta report. ALE-186 is canonical; ALE-188 should be closed as duplicate in Linear.

**Milestone scope note:** M13 was proposed with issues ALE-183→189. ALE-190 was added during execution when the P1 slow-login bug was discovered in ALE-186's weekly report. The canonical set is 7 issues (excluding ALE-188 duplicate).

---

## 3. What Shipped

### 3.1 Retention nudge component (ALE-184)

- `ContinueWhereYouLeftOff` client component on `/dashboard`
- Shows returning users their 3 most recently updated boards with funnel status
- Vietnamese copy from `docs/retention-nudges-v1.md`
- Session-gated (max once per session via `sessionStorage`)

### 3.2 Nudge analytics events (ALE-183/185)

- `nudge_shown` and `nudge_clicked` event types added to `analytics_event_type` ENUM
- Server actions `trackEvent("nudge_shown", ...)` and `trackEvent("nudge_clicked", ...)` fire on nudge render and CTA click
- Migration `add-nudge-analytics-events.sql` applied to production 2026-06-06 03:12 UTC (verified via `pg_enum`)

### 3.3 Production ENUM migration

- `ALTER TYPE analytics_event_type ADD VALUE 'nudge_shown'` — applied
- `ALTER TYPE analytics_event_type ADD VALUE 'nudge_clicked'` — applied
- Idempotent migration with `DO` block and `EXISTS` checks
- No data migration, no table creation, no RLS change

### 3.4 Weekly beta report (ALE-186)

- `docs/weekly-reports/weekly-report-2026-06-06.md` (~430 lines)
- Full template filled with production Supabase data via read-only SQL queries
- Activation funnel: 5 users, 1 power user, 1/5 completed full flow (20%)
- Day-1 retention: insufficient data (n=1). Day-7: cannot measure (3-day window)
- 1 P1 feedback: slow login. 0 WTP signals. 0 beta_testers rows

### 3.5 Baseline retention measurement (ALE-187)

- `docs/baseline-retention-measurement.md` (278 lines)
- Read-only Supabase SQL queries, event summary (71 events / 5 users)
- Signup-to-login gap identified (4 signup-only users with 0 login events)
- Re-measurement SQL guide for Day-1/Day-7 after June 10

### 3.6 Cohort 2 decision gate (ALE-189)

- `docs/cohort-2-decision-gate-2026-06-06.md` (~280 lines, 8 sections)
- Verdict: **WAIT** (3 ✅ / 3 ⬜ / 5 ❌ / 1 N/A)
- Production ENUM migration applied — nudge telemetry unblocked
- Remaining blockers: insufficient data window, empty beta_testers, no WTP, low sample size
- Added §6.5 WTP question template to `docs/retention-nudges-v1.md`

### 3.7 P1 slow-login fix (ALE-190)

- `vercel.json` (NEW): `regions: ["syd1"]`
- Root cause: Vercel functions defaulted to us-east-1 while Supabase is in ap-southeast-2 (Sydney). 3 sequential `getUser()` calls stacked ~600ms+ in cross-region round-trips
- Fix: colocate all serverless functions with Supabase in Sydney
- `docs/triage/ale-190-slow-login-triage.md` (NEW, ~130 lines): full triage evidence
- Expected improvement: login→dashboard from 3-5s → <1s warm, ~1.5s cold start

---

## 4. Production State (2026-06-06)

| Component | State |
|-----------|-------|
| **Vercel region** | `syd1` (Sydney) — colocated with Supabase |
| **Latest deploy** | `f05c15c` on main (ALE-190 merged) |
| **Supabase ENUM** | `analytics_event_type` includes `nudge_shown`, `nudge_clicked` |
| **Nudge events recorded** | 0 (awaiting tester visits) |
| **Decision gate verdict** | WAIT (3 ✅ / 3 ⬜ / 5 ❌ / 1 N/A) |
| **P1 slow-login** | Fixed (vercel.json regions=[syd1]) |
| **beta_testers table** | 0 rows (not yet populated) |
| **Auth users** | 5 (1 power user, 4 signup-only) |
| **feedback_entries** | 5 (1 P1 slow-login, now triaged+fixed) |

---

## 5. Guardrails

| Guardrail | Status | Details |
|-----------|--------|---------|
| No payment changes | ✅ Held | No pricing, billing, or payment code touched |
| No messaging automation | ✅ Held | Nudge is UI component only, no push/email/SMS |
| No secrets exposed | ✅ Held | All credentials in `.env.local`, never echoed |
| Migration scope | ✅ Minimal | `add-nudge-analytics-events.sql` — additive ENUM only, applied by owner |
| No destructive SQL | ✅ Held | All Supabase queries were read-only (SELECT only) |
| User data anonymized | ✅ Held | Reports reference "tester-01", no PII |
| No auth provider change | ✅ Held | Auth flow unchanged, only Vercel region config changed |
| Config-only infra change | ✅ ALE-190 | `vercel.json` regions=[syd1] — reversible by deleting the file |

**Exceptions explicitly approved:** None. All changes were within original M13 scope or added via ALE-190 (P1 bug discovered during M13 execution).

---

## 6. Remaining Blockers (for Cohort 2 GO decision)

These are NOT M13 blockers (M13 is complete). They are Cohort 2 expansion blockers identified by the decision gate:

| # | Blocker | Impact | Owner action needed |
|---|---------|--------|---------------------|
| 1 | **beta_testers empty** | Cannot track cohort membership or measure retention per tester | Populate from Google Sheet |
| 2 | **0 nudge events** | Cannot measure nudge CTR or engagement | Prompt tester-01 to revisit `/dashboard` |
| 3 | **0 WTP signals** | Cannot assess willingness to pay | Send WTP question (template in `retention-nudges-v1.md` §6.5) |
| 4 | **Insufficient Day-7 data** | Only 3 days of production data (need 7+) | Wait until 2026-06-10 for Day-7, 2026-06-13 for 10-day |
| 5 | **Low sample size** | 5 auth users, 1 power user | Continue inviting Cohort 2 testers |
| 6 | **P1 slow-login** | ~~Untriaged~~ **Fixed** (ALE-190) | Verify fix with real tester feedback |

---

## 7. M14 Recommendation

### Milestone name

**M14 — Cohort 2 Data Collection & Decision**

### Goal

Collect sufficient Cohort 2 data (7+ days, 5+ completed tests, WTP signals) to re-evaluate the expansion decision gate from WAIT to GO or NO-GO.

### Proposed issues (priority order)

| # | Issue | Type | Priority | Risk | Rationale |
|---|-------|------|----------|------|-----------|
| 1 | **Populate beta_testers from Google Sheet** | App code | P0 | Low | Unblocks cohort tracking, retention measurement, and nudge targeting |
| 2 | **Re-measure Day-7 retention (2026-06-10)** | Docs | P1 | Low | First valid Day-7 data point. Read-only SQL, no code change |
| 3 | **Send WTP question to tester-01** | Docs | P1 | Low | Template exists in `retention-nudges-v1.md` §6.5. Manual send, no automation |
| 4 | **Second weekly beta report (2026-06-10)** | Docs | P2 | Low | Fill template with fresh data. Compare week-over-week |
| 5 | **Cohort 2 decision gate re-evaluation (2026-06-13)** | Docs | P2 | Low | Re-run 12-criterion assessment with 10-day data |
| 6 | **Deduplicate getUser() in layout + page** | App code | P3 | Medium | React `cache()` or server action context. Saves 1 round-trip even after syd1 fix |
| 7 | **Parallelize getCurrentWorkspace() with getUser()** | App code | P3 | Medium | Minor perf improvement, non-blocking |

### Risk classification

| Risk | Level | Mitigation |
|------|-------|------------|
| Insufficient tester engagement | Medium | Manual outreach via WTP question + nudge prompt |
| Day-7 data still insufficient by 06-10 | Low | Extend window to 06-13 |
| getUser() deduplication breaks auth | Medium | Test thoroughly, deploy behind feature flag if needed |
| beta_testers population breaks existing data | Low | Additive only, no schema change |

### Docs-only vs app-code split

| Type | Issues | Count |
|------|--------|-------|
| Docs-only | #2, #3, #4, #5 | 4 |
| App code | #1, #6, #7 | 3 |

---

## 8. Recommendation

### Should M13 be closed now?

**Yes.** All 7 canonical issues (excluding ALE-188 duplicate) are Done in Linear, merged to main, and deployed to production. The WAIT verdict is a data outcome, not a milestone failure. M13 delivered the measurement infrastructure; the data window simply needs more time.

### Should M14 start now?

**Wait until 2026-06-10.** Rationale:

1. **Day-7 data becomes available on 2026-06-10** (7 days after first production data on 2026-06-03). Starting M14 before this means no new data to act on.
2. **Owner actions first:** Populate `beta_testers`, prompt tester-01 to revisit `/dashboard`, send WTP question. These are manual actions that don't need a milestone.
3. **Issue #1 (populate beta_testers) can start immediately** as a standalone task outside M14 if the owner wants to unblock cohort tracking sooner.
4. **Issue #2 (Day-7 re-measurement) is date-gated to 2026-06-10** — no point creating it before then.

**Recommended timeline:**

| Date | Action |
|------|--------|
| 2026-06-06 (now) | Close M13. Owner populates beta_testers. Owner sends WTP question to tester-01. |
| 2026-06-07–09 | Monitor nudge events and tester engagement |
| 2026-06-10 | Start M14. Re-measure Day-7 retention. Second weekly report. |
| 2026-06-13 | Decision gate re-evaluation. GO/NO-GO/WAIT verdict. |

---

*Filed by: Kiro (Hermes Autopilot), 2026-06-06*