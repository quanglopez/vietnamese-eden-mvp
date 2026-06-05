# M12 — Beta Launch & Activation Planning Brief

**Drafted:** 2026-06-05  
**Status:** Draft — awaiting owner review  
**Author:** Hermes (orchestrator/reviewer)

---

## 1. Goal

Move Vietnamese Eden from beta-ready product to measurable closed-beta launch with feedback loops, activation tracking, and retention improvements.

## 2. Context from M11

M11 — Beta Launch Readiness shipped all 5 issues to production:

| Issue | Title | PR | Commit | Status |
|-------|-------|----|--------|--------|
| ALE-171 | Analytics dashboard MVP | #19 | `07688ea` | ✅ Done |
| ALE-172 | Beta tester invite + cohort tracker | #20 | `c48695b` | ✅ Done |
| ALE-173 | Feedback inbox automation | #21 | `743ddd1` | ✅ Done |
| ALE-174 | Pricing/paywall readiness | #22 | `3017dbc` | ✅ Done |
| ALE-175 | Production reliability hardening | #18 | `4bd515f` | ✅ Done |

- Production smoke: 15/15 PASS
- /api/health active, AI rate-limit guard active
- Analytics dashboard, beta tester tracker, feedback inbox all functional (admin-only)
- Pricing feature-flagged off by default (`NEXT_PUBLIC_PRICING_ENABLED=false`), no Stripe dependency
- Two procedural guardrail breaches recorded (ALE-174, ALE-175) — corrective action in `kanban-working-agreement.md` §8

## 3. M12 Success Metrics

| # | Metric | Target |
|---|--------|--------|
| 1 | Beta testers invited | 20–50 |
| 2 | Complete first board → content → breakdown flow | ≥60% |
| 3 | Create at least one remix | ≥30% |
| 4 | Add output to calendar | ≥20% |
| 5 | Qualified feedback entries normalized | ≥10 |
| 6 | P0/P1 bugs triaged within 24h | 100% |
| 7 | Strong qualitative signals on willingness to pay | ≥5 |

## 4. Proposed Workstreams

### A. Beta launch operations
- Beta invite flow (manual + tracker-based)
- Tester cohort tracking via ALE-172 infrastructure
- Onboarding instructions per persona
- Manual support checklist for Hermes/owner
- Launch announcement copy (Zalo, email, direct)

### B. Feedback-to-Linear automation
- Convert feedback entries into Linear issue candidates
- P0/P1/P2/P3 priority mapping from ALE-173 category system
- Duplicate detection (keyword + category matching)
- Analyst review step before creating issues
- **No auto-create without owner approval in v1**

### C. Cohort analytics
- Segment beta testers by persona, invite status, signup status, core-flow status, feedback status
- Activation funnel by workspace/cohort
- Track key events: signup → board → content → breakdown → remix → calendar
- Weekly beta report (automated from analytics_events + feedback_entries)

### D. Activation improvements
- Improve empty states (dashboard, board, calendar)
- First-run guidance (tooltips, walkthrough, sample data)
- Sample content templates (paste text examples, URL examples)
- "Next best action" on dashboard after each step
- Reduce confusion between board/content/breakdown/remix/calendar

### E. Onboarding / retention
- Better onboarding checklist (progress indicators, clear next step)
- Email/Zalo/manual follow-up prompts for inactive testers
- Return-user nudges ("Continue where you left off")
- Saved views / calendar reminders (build on ALE-163)
- Lightweight weekly digest concept (email or in-app)

## 5. Recommended Linear Issues

**Do not create these issues yet — owner review required.**

### 5.1 M12 — Beta launch command center
- **Problem:** No single view to manage beta operations (invite status, signup status, core-flow completion, feedback status) across all testers.
- **Scope:** Build on ALE-171 (analytics) + ALE-172 (tracker) + ALE-173 (feedback) to create a unified admin command center.
- **Acceptance criteria:**
  - Single admin page showing all testers with status across invite → signup → core-flow → feedback
  - Filter by persona, status, cohort
  - Quick actions: change status, send reminder, view analytics
  - Vietnamese copy
  - Mobile responsive
  - `npm run lint && npm run type-check && npm run build` pass
- **Migration:** No (uses existing tables)
- **Suggested implementer:** Cursor (app code), Hermes (review/smoke)
- **Risk:** Low — builds on existing infrastructure

### 5.2 M12 — Feedback-to-Linear candidate generator
- **Problem:** Feedback entries from ALE-173 are normalized but require manual Linear issue creation. Need a bridge from feedback inbox to Linear triage.
- **Scope:** Create a "Generate Linear candidate" action on feedback entries that pre-fills issue title, description, priority, and labels based on ALE-173 auto-classify output.
- **Acceptance criteria:**
  - "Create Linear issue" button on each feedback entry (admin-only)
  - Pre-fills: title (from raw_summary), description (quotes + notes), priority (from ALE-173 priority), labels (from category)
  - **No auto-create** — requires explicit admin click + confirmation
  - Shows duplicate warning if similar feedback entry already has a linked Linear issue
  - Does NOT call Linear API directly — outputs a copy-paste ready format or uses webhook/manual step
  - `npm run lint && npm run type-check && npm run build` pass
- **Migration:** Maybe — link table `feedback_linear_issues` for duplicate detection
- **Suggested implementer:** Cursor (app code), Hermes (review/smoke)
- **Risk:** Medium — must not auto-create issues without owner approval

### 5.3 M12 — Cohort activation analytics
- **Problem:** ALE-171 analytics dashboard shows aggregate event counts but does not segment by cohort/persona or show activation funnel per tester group.
- **Scope:** Extend analytics dashboard with cohort segmentation and activation funnel views.
- **Acceptance criteria:**
  - Cohort filter: by persona, invite date range, source
  - Activation funnel per cohort: signup → board → content → breakdown → remix → calendar
  - Drop-off visualization per step
  - Tester-level detail drill-down (admin-only, no raw user content)
  - Export CSV option
  - `npm run lint && npm run type-check && npm run build` pass
- **Migration:** Maybe — if aggregation views/functions needed
- **Suggested implementer:** Cursor (app code), Hermes (review/smoke)
- **Risk:** Low — analytics extension, no schema change expected

### 5.4 M12 — First-run activation improvements
- **Problem:** New beta testers face empty states with unclear next steps. Activation rate (signup → first content → first breakdown) is unknown but likely low without guidance.
- **Scope:** Improve empty states, add first-run guidance, sample content, and "next best action" prompts on dashboard.
- **Acceptance criteria:**
  - Empty dashboard: show "Bắt đầu" CTA with 3-step guide (add content → breakdown → remix)
  - Empty board: show sample content card with "Thêm nội dung đầu tiên" prompt
  - After first breakdown: show "Tạo Remix" prompt
  - After first remix: show "Thêm vào Lịch" prompt
  - "Next best action" section on dashboard
  - Sample paste-text content template (Vietnamese social media post example)
  - All copy in Vietnamese
  - `npm run lint && npm run type-check && npm run build` pass
- **Migration:** No
- **Suggested implementer:** Cursor (app code), Hermes (review/smoke)
- **Risk:** Low — UI-only, no schema change

### 5.5 M12 — Beta tester onboarding guide + support checklist
- **Problem:** No standardized onboarding guide for beta testers. Manual support is ad-hoc. Need a reusable guide and a support checklist for Hermes/owner.
- **Scope:** Create an onboarding guide (Vietnamese) and a support checklist document.
- **Acceptance criteria:**
  - `docs/beta-onboarding-guide.md` — step-by-step guide for testers (add content, run breakdown, create remix, add to calendar)
  - `docs/beta-support-checklist.md` — Hermes/owner checklist (invite → follow-up → triage feedback → check analytics → weekly summary)
  - Vietnamese copy throughout
  - Linked from project-status.md
  - No app code changes unless onboarding UI widget is scoped
- **Migration:** No
- **Suggested implementer:** Hermes (docs), Cursor (if UI widget scoped)
- **Risk:** Low — docs-only

### 5.6 M12 — Weekly beta report template
- **Problem:** No structured way to produce a weekly beta report summarizing activation, feedback, and bugs.
- **Scope:** Create a weekly report template (markdown) and optionally an auto-generator from analytics_events + feedback_entries.
- **Acceptance criteria:**
  - `docs/weekly-beta-report-template.md` — sections: testers invited/signed-up/active, activation funnel, top feedback, bugs found, P0/P1 status, next actions
  - Optional: admin page that auto-fills template from DB (v1 can be manual)
  - If auto-generator: no raw user content in output
  - `npm run lint && npm run type-check && npm run build` pass if app code
- **Migration:** No
- **Suggested implementer:** Hermes (template), Cursor (auto-generator if scoped)
- **Risk:** Low

### 5.7 M12 — Retention nudges v1
- **Problem:** Beta testers may sign up and never return. Need lightweight retention nudges.
- **Scope:** Implement in-app return-user nudges and document follow-up prompts.
- **Acceptance criteria:**
  - "Tiếp tục từ lần trước" section on dashboard for returning users
  - Calendar reminder for items added to calendar (build on ALE-163 saved views)
  - Follow-up prompt doc: email/Zalo template for inactive testers (7 days no activity)
  - No automated email/Zalo sending — manual prompts only in v1
  - `npm run lint && npm run type-check && npm run build` pass
- **Migration:** No (uses existing tables)
- **Suggested implementer:** Cursor (app code), Hermes (docs)
- **Risk:** Low — no external integrations

## 6. Recommended Sequencing

| Order | Issue | Rationale |
|-------|-------|-----------|
| 1 | M12 — Beta launch command center | Foundation — unifies ALE-171/172/173 into single ops view |
| 2 | M12 — Beta tester onboarding guide + support checklist | Needed before inviting testers |
| 3 | M12 — Cohort activation analytics | Needed to measure success metrics |
| 4 | M12 — Feedback-to-Linear candidate generator | Needed once feedback starts flowing |
| 5 | M12 — First-run activation improvements | Needed to improve activation rate |
| 6 | M12 — Weekly beta report template | Needed for ongoing operations |
| 7 | M12 — Retention nudges v1 | Lower priority — activate first, retain later |

## 7. Risks and Guardrails

| # | Risk / Guardrail | Severity |
|---|-----------------|----------|
| 1 | **Avoid over-automation** before enough real beta feedback | High |
| 2 | **Do not auto-create Linear issues** without owner approval | Hard block |
| 3 | **Do not add Google Sheets/Drive OAuth** in M12 unless explicitly required | Medium |
| 4 | **Do not change pricing/paywall behavior** — keep `NEXT_PUBLIC_PRICING_ENABLED=false` | Hard block |
| 5 | **Do not add hard paywalls** — payment features remain disabled | Hard block |
| 6 | **Any migration requires** SQL review + owner confirm apply migration | Hard block |
| 7 | **Any merge requires** exact owner confirm phrase ("Confirm merge PR #N") | Hard block |
| 8 | **Do not send automated email/Zalo** without explicit owner approval | Medium |
| 9 | **Keep admin pages admin-only** — RLS enforcement, no data leak | Hard block |
| 10 | **No service role on client** — server-side only | Hard block |

## 8. Open Questions for Owner

1. **How many beta testers are targeted for M12?** (20? 50? more?)
2. **Which persona is priority?** Creator, agency, educator/coach, beauty/lifestyle, or all equally?
3. **Should feedback source stay manual paste** (current ALE-173 flow), or add Google Sheets import in M12?
4. **Should M12 optimize for activation or paid conversion signal first?** These may have different UX priorities.
5. **Should beta launch be private only** (invite-only, no public page) or include a public waitlist?
6. **Should the weekly beta report be manual** (Hermes generates from DB) or auto-generated in-app?
7. **Any specific beta launch date target?** Helps with sequencing urgency.
