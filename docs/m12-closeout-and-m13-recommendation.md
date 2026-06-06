# M12 Closeout Summary & M13 Recommendation — Vietnamese Eden MVP

**Milestone:** M12 — Beta Launch & Activation
**Period:** 2026-06-05 → 2026-06-06 (2 days)
**Status:** COMPLETE (7/7 issues Done in Linear)
**Latest SHA on main:** `865d0ed`
**Production health:** `https://vietnamese-eden-mvp.vercel.app/api/health` → HTTP 200
**Pronouncement:** M12 đóng. Không bắt đầu M13 cho tới khi owner review và approve.

---

## 1. M12 Issue Completion

| # | Issue | Title | PR | Merge SHA | Type | Breach? |
|---|-------|-------|----|-----------|------|---------|
| 1 | ALE-176 | Beta launch command center | #23 | `a897221` | App code | No |
| 2 | ALE-177 | Beta tester onboarding guide + support checklist | #24 | `6306531` | Docs-only | No |
| 3 | ALE-178 | Cohort activation analytics | #25 | `28b33ec` | App code | No |
| 4 | ALE-179 | Feedback-to-Linear candidate generator | #26 | `3553fcc` | App code | No |
| 5 | ALE-180 | First-run activation improvements | #27 | `3ff6328` | App code | No |
| 6 | ALE-181 | Weekly beta report template | #29 | `d3bb887` | Docs-only | No |
| 7 | ALE-182 | Retention nudges v1 | #30 | `df13ba1` | Docs-only | No |

**Total:** 4 app-code PRs + 3 docs-only PRs. Zero guardrail breaches.

---

## 2. What Shipped

### App code (4 PRs)

**ALE-176** — Beta launch command center
- `/admin/beta-launch` read-only dashboard: 6 overview cards, cohort/persona breakdown, activation snapshot, tester readiness table, support checklist, limitation notes.
- Sidebar "Beta Launch" nav entry on all admin pages.
- Production smoke: 15/15 PASS.

**ALE-178** — Cohort activation analytics
- `/admin/analytics` cohort/persona section: `cohort-queries.ts` (beta_testers + analytics_events JS merge), persona funnels (board→content→breakdown→remix→calendar, no login/signup), unattributed grouping ("Không xác định"), data confidence, limitation notes.
- `buildFunnel()` extracted as reusable helper. `PERSONA_FUNNEL` separated from `DASHBOARD_FUNNEL`.
- No migration — read-only queries on existing tables.

**ALE-179** — Feedback-to-Linear candidate generator
- `/admin/feedback` action button "Tạo nháp Linear" → modal with markdown preview + copy-to-clipboard + draft warning.
- `buildLinearCandidateDraft()` utility + unit tests.
- **No Linear API call.** Preview-only. Owner copies draft manually.

**ALE-180** — First-run activation improvements
- Dashboard Next Best Action logic + calendar count.
- Onboarding checklist NAB card.
- Board detail "Thử nội dung mẫu" button → Add Content modal with sample content prefill.
- Breakdown view better empty state.
- `getWorkspaceCalendarCount()` query, `sample-content.ts`.
- 7 files changed, no migration.
- Authenticated production smoke: 11/11 PASS.

### Docs (3 PRs)

**ALE-177** — Beta tester onboarding guide + support checklist
- `docs/beta-tester-onboarding-guide.md` (153 lines): Tester-facing 8-step guide + FAQ + limitations.
- `docs/beta-support-checklist.md` (102 lines): Per-tester progress tracking, follow-up triggers, triage categories.

**ALE-181** — Weekly beta report template
- `docs/weekly-beta-report-template.md` (345 lines): Activation metrics funnel, feedback patterns, top bugs/risks, WTP signals, product learnings, next actions, decision gate (GO/NO-GO/WAITING), Supabase SQL pull checklist, Hermes generation prompt, Vietnamese section headers.

**ALE-182** — Retention nudges v1
- `docs/retention-nudges-v1.md` (379 lines): Retention problem (Day-1/Day-7 drop-off, core funnel gaps), 5 user segments, trigger rules, in-app nudge proposal ("Tiếp tục từ lần trước" — UX spec + Vietnamese copy variants), 4 follow-up templates (7-day, 14-day escalation, post-core-flow, post-feedback), measurement plan with Supabase SQL baseline queries, guardrails (8 rules), future M13+ implementation notes.

**Total new docs:** 4 files, ~978 lines.

---

## 3. Guardrails Status

| # | Guardrail | Status | Detail |
|---|-----------|--------|--------|
| 1 | No automated email/Telegram/Zalo | ✅ Held | All follow-up is manual templates (ALE-182 §6) |
| 2 | No scheduled jobs / cron | ✅ Held | Zero server-side scheduling |
| 3 | No migration | ✅ Held | ALE-178 = read-only queries only. No schema changes in M12. |
| 4 | No payment change | ✅ Held | `NEXT_PUBLIC_PRICING_ENABLED=false` unchanged |
| 5 | No secrets | ✅ Held | No new env vars |
| 6 | No production data mutation | ✅ Held | Analytics dashboard + feedback candidate are read-only |
| 7 | Owner confirmed merge for every PR | ✅ Held | Zero procedural breaches in M12 |
| 8 | No automated Linear issue creation | ✅ Held | ALE-179 is preview-only draft, no API call |

**M12 guardrail record: 8/8 held. Zero breaches.** (Compare: M11 had 2 procedural breaches on ALE-174 and ALE-175.)

---

## 4. Remaining Risks

| # | Risk | Severity | Source | Mitigation |
|---|------|----------|--------|------------|
| 1 | **Retention baseline unknown** | Medium | ALE-182 §8 | SQL queries documented but not yet executed. Need real cohort data before nudge ships. |
| 2 | **In-app nudge not implemented** | Medium | ALE-182 §5 | "Tiếp tục từ lần trước" is docs-only proposal. Requires separate ALE in M13+. |
| 3 | **Follow-up is manual-only** | Low by design | ALE-182 §7 | Owner sends templates individually. Risk: low response rate if owner busy. |
| 4 | **Cohort 2 decision gate pending** | Medium | project-status.md | "5 completed tests OR 7–10 days" threshold not yet evaluated. |
| 5 | **Admin features untested outside owner** | Low | ALE-176–180 | Only ggonevn@gmail.com via local dev. No external admin tester. |
| 6 | **Unbounded table growth** | Low | ALE-172/173 | `beta_testers` + `feedback_entries` have no archival/cleanup strategy. |
| 7 | **M8 oEmbed risks** | Watch | known-limitations.md | TikTok/Instagram blocking — P3 watch, no code action. |
| 8 | **No automated feedback intake** | Low | ALE-173 | Feedback is manual paste. Google Sheets import is M13+ candidate. |

---

## 5. M13 Recommendation

⚠️ **Do not create M13 issues or start implementation until owner approves this plan.**

### Proposed milestone

**M13 — Retention & Iteration**
**Goal:** Increase Day-7 return rate, implement in-app nudge, execute first weekly beta report with real data, and fix top P1 bugs surfaced from Cohort 2 feedback.

### Proposed issues (priority order)

| # | Proposed ALE | Title | Type | Risk | Description |
|---|-------------|-------|------|------|-------------|
| 1 | ALE-183 | Continue-where-you-left-off dashboard component | App code | Low | Implement in-app nudge from ALE-182 §5. `ContinueWhereYouLeftOff` server component on dashboard, shows last 2–3 boards with CTA (breakdown/remix/calendar). Vietnamese copy from ALE-182 §5.4. Query existing `boards` + `analytics_events`. No new table. |
| 2 | ALE-184 | Baseline retention measurement (Day-1 / Day-7) | App code | Low | Add `nudge_shown` + `nudge_clicked` event types to `analytics_events`. Run baseline SQL from ALE-182 §8.3. Record pre-nudge return rates. Ship alongside ALE-183 so we can A/B after. |
| 3 | ALE-185 | First weekly beta report (real data) | Docs-only | Low | Fill weekly-beta-report-template.md with actual Supabase data from first full cohort week. Owner review. Manual workflow — no automation. |
| 4 | ALE-186 | Cohort 2 decision gate evaluation | Docs-only | Low | Evaluate "5 completed tests OR 7–10 days" threshold. GO/NO-GO/WAITING recommendation. Inform M14 scope. |
| 5 | ALE-187 | Top P1 bug fixes from Cohort 2 feedback | App code | Medium | Scope depends on feedback triage. Likely AI quality, UX confusion, or edge cases. Exact issues determined after ALE-185 + triage. |
| 6 | ALE-188 | Beta feedback auto-ingest (Google Sheets → Supabase) | App code | Medium | Replace manual paste with scheduled sync from Google Sheets form responses. Requires Google Sheets API read-only access. |
| 7 | ALE-189 | Admin table archival strategy | Docs-only | Low | Document retention policy for `beta_testers` + `feedback_entries`. Define archival rules, scheduled cleanup candidate, data export format. No code yet. |

### Risk classification

| Issue | Risk | Migration? | Automation? | Secrets? | Payment? |
|-------|------|-----------|-------------|----------|----------|
| ALE-183 | Low | No | No | No | No |
| ALE-184 | Low | No | No | No | No |
| ALE-185 | Low (docs) | No | No | No | No |
| ALE-186 | Low (docs) | No | No | No | No |
| ALE-187 | Medium (depends on bugs found) | Maybe | No | No | No |
| ALE-188 | Medium (external API) | Maybe | Yes (scheduled sync) | Yes (Google API key) | No |
| ALE-189 | Low (docs) | No | No | No | No |

### Docs-only vs app-code split

| Category | Issues |
|----------|--------|
| **Docs-only** | ALE-185, ALE-186, ALE-189 |
| **App code** | ALE-183, ALE-184, ALE-187, ALE-188 |

### What NOT to start in M13

- ❌ Pricing/paywall activation (`NEXT_PUBLIC_PRICING_ENABLED=false` stays)
- ❌ Google OAuth enablement
- ❌ A/B test nudge variants (population too small — need ≥50 testers, M14+)
- ❌ Automated email/Telegram/Zalo sending (M14+)
- ❌ New migrations without explicit owner approval
- ❌ Any M13 work until owner approves this plan

---

## 6. M12 → M13 Transition Checklist

| # | Item | Owner | Status |
|---|------|-------|--------|
| 1 | Review M12 closeout summary | Owner | ⬜ Pending |
| 2 | Review M13 recommendation | Owner | ⬜ Pending |
| 3 | Fill first weekly beta report (ALE-185) data | Owner + Hermes | ⬜ Pending (after ≥7 days of Cohort 2 data) |
| 4 | Run baseline retention SQL (ALE-182 §8.3) | Hermes | ⬜ Pending |
| 5 | Evaluate Cohort 2 decision gate | Owner | ⬜ Pending (after 5 completed tests or 7–10 days) |
| 6 | Create M13 Linear issues (only after owner approves plan) | Hermes | ⬜ Pending |
| 7 | Archive M12 Linear issues if applicable | Owner | ⬜ Pending |

---

*Closeout generated 2026-06-06 by Hermes Autopilot. All 7 M12 issues Done in Linear. Production healthy (HTTP 200). Latest commit: `865d0ed` on main. No code changes in this document. No migrations. No automation. No M13 work started.*