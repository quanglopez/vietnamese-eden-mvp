# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-06-05 (M12 — ALE-179 Done, M12 IN PROGRESS)
**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)
**Latest deploy:** commit `3553fcc` on main (ALE-179 PR #26 squashed 2026-06-05)
**Tiếp theo:** ALE-180 — First-run activation improvements
Feedback source of truth:

[https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/](https://docs.google.com/spreadsheets/d/15dJSsUpHUTsm96NNb2GIltsx1MnNuNlsWD04EP5jjx4/)

---

## Stack & repos


| Layer               | Công nghệ / repo                                                                      |
| ------------------- | ------------------------------------------------------------------------------------- |
| **UI prototype**    | **Lovable** + TanStack Start — `C:\Users\ADMIN\s-ng-t-o-vi-t` (mock UI, không deploy) |
| **Production app**  | **Next.js 14** App Router — `C:\Users\ADMIN\vietnamese-eden-mvp`                      |
| **Port & backend**  | **Cursor** — port UI từ Lovable prototype, Supabase, auth, AI, deploy Vercel          |
| **Database / auth** | Supabase (Postgres + RLS + Auth)                                                      |
| **AI (production)** | Xiaomi MiMo V2.5 (`AI_PROVIDER=xiaomi`, `mimo-v2.5`); OpenAI fallback trong code      |


**Frontend workflow:** [frontend-workflow.md](./frontend-workflow.md) · **UI audit:** [ui-port-audit.md](./ui-port-audit.md)

---

## Beta readiness

| Phase | Status |
|-------|--------|
| Core MVP on production | **Ready** (ALE-88) |
| Onboarding + limitations | **Ready** |
| Inviting first cohort | **Done** (ALE-89) |
| Feedback triage round 1 | **Done** (ALE-90) |
| Beta fixes ALE-141→145 | **Done** ✅ |
| Production smoke test | **Done** (ALE-146 — NO-GO verdict) |
| ALE-148 (CJK leakage) | ✅ Done (commit `ab8b984`) |
| ALE-149 (generic titles) | ✅ Done (commit `01d5de3`) |
| ALE-150 (hide Google OAuth) | ✅ Done (commit `4417d3d`) |
| ALE-151 (final mini smoke) | ✅ Done (production smoke PASS) |
| Inviting next cohort | **Cohort 2: inviting** 📨 |
| Cohort 2 feedback tracking | [beta-feedback-round-2.md](./beta-feedback-round-2.md) |
| **Next decision point** | **After 5 completed tests OR 7–10 days** (whichever first) |
| **M8 milestone** | **COMPLETE** — pipeline shipped (ALE-154, ALE-155, ALE-156, ALE-157, ALE-158, ALE-159) | [social-url-importer-plan.md](./social-url-importer-plan.md) |
| **M9 milestone** | **COMPLETE** — Content Library & Search (ALE-161, ALE-162, ALE-163, ALE-164, ALE-165) |
| **M10 milestone** | **COMPLETE** — Beta QA & Activation (ALE-166, ALE-167, ALE-168, ALE-169, ALE-170) |
| **M10 progress** | ALE-166 ✅ Done · ALE-167 ✅ Done · ALE-168 ✅ Done · ALE-169 ✅ Done · ALE-170 ✅ Done |
| **Next recommended** | M11 — Beta Launch Readiness (ALE-171→175 proposed) |
| **M11 milestone** | **COMPLETE** — Beta Launch Readiness (ALE-171, ALE-172, ALE-173, ALE-174, ALE-175) |
| **M11 progress** | ALE-171 ✅ Done · ALE-172 ✅ Done · ALE-173 ✅ Done · ALE-174 ✅ Done · ALE-175 ✅ Done |
| **M12 milestone** | **IN PROGRESS** — Beta Launch & Activation (ALE-176→182) |
| **M12 progress** | ALE-176 ✅ Done · ALE-177 ✅ Done · ALE-178 ✅ Done · ALE-179 ✅ Done · ALE-180 Backlog · ALE-181 Backlog · ALE-182 Backlog |

### M11 COMPLETE — Beta Launch Readiness closeout (2026-06-05)

All 5 M11 issues shipped to production.

| Issue | Title | PR | Commit | Completed | Breach? |
|-------|-------|----|--------|-----------|---------|
| [ALE-171](https://linear.app/alexgpt/issue/ALE-171) | Analytics dashboard MVP | [#19](https://github.com/quanglopez/vietnamese-eden-mvp/pull/19) | `07688ea` | 2026-06-04 | No |
| [ALE-172](https://linear.app/alexgpt/issue/ALE-172) | Beta tester invite + cohort tracker | [#20](https://github.com/quanglopez/vietnamese-eden-mvp/pull/20) | `c48695b` | 2026-06-04 | No |
| [ALE-173](https://linear.app/alexgpt/issue/ALE-173) | Feedback inbox automation | [#21](https://github.com/quanglopez/vietnamese-eden-mvp/pull/21) | `743ddd1` | 2026-06-04 | No |
| [ALE-174](https://linear.app/alexgpt/issue/ALE-174) | Pricing/paywall readiness | [#22](https://github.com/quanglopez/vietnamese-eden-mvp/pull/22) | `3017dbc` (squash) | 2026-06-04 | Yes — see postmortem |
| [ALE-175](https://linear.app/alexgpt/issue/ALE-175) | Production reliability hardening | [#18](https://github.com/quanglopez/vietnamese-eden-mvp/pull/18) | `4bd515f` | 2026-06-04 | Yes — see postmortem |

#### Production readiness checklist

| # | Check | Result |
|---|-------|--------|
| 1 | All 5 issues Done in Linear | ✅ PASS |
| 2 | All 5 PRs merged to main | ✅ PASS |
| 3 | Production smoke full suite | ✅ PASS (ALE-174: 15/15) |
| 4 | /api/health (app + Supabase) responsive | ✅ PASS (ALE-175) |
| 5 | AI breakdown functional (xiaomi:mimo-v2.5) | ✅ PASS (ALE-175) |
| 6 | AI rate-limit guard active | ✅ PASS (ALE-175) |
| 7 | Analytics dashboard accessible (admin-only) | ✅ PASS (ALE-171) |
| 8 | Beta tester tracker functional (admin-only) | ✅ PASS (ALE-172) |
| 9 | Feedback inbox functional (admin-only) | ✅ PASS (ALE-173) |
| 10 | Pricing feature-flagged off by default | ✅ PASS (ALE-174) |
| 11 | No Stripe dependency in production | ✅ PASS (ALE-174) |
| 12 | Working tree clean | ✅ Yes |

#### Guardrail note

M11 had two procedural guardrail breaches (ALE-174, ALE-175) where PRs were merged and Linear auto-closed without explicit owner confirmation. No technical impact from either breach. See postmortems below. Corrective action per `kanban-working-agreement.md` §8: agents must stop at READY TO MERGE and wait for exact owner confirmation before merge.

#### M11 closeout actions

- [x] All 5 issues Done in Linear
- [x] All 5 PRs merged to main
- [x] Production smoke PASS (15/15)
- [x] Postmortems recorded for ALE-174, ALE-175
- [x] project-status.md updated with closeout
- [ ] Linear "M11 — Beta Launch Readiness" project archived (manual — Linear API no-op for project state)
- [ ] Beta launch decision + M12 planning

### M11 postmortem — ALE-174 procedural breach (2026-06-05)

| Item | Detail |
|------|--------|
| **Issue** | ALE-174 — Pricing/paywall feature flag + guardrails |
| **What shipped** | PR #22 (squash merge → `3017dbc`): pricing feature flag (`NEXT_PUBLIC_PRICING_ENABLED=false` default), no Stripe dependency, no `/api/stripe` routes or webhooks |
| **Migration** | None — feature-flag only, no schema changes |
| **Smoke** | Production smoke 15/15 PASS |
| **Breach** | PR #22 merged via squash and Linear ALE-174 auto-closed by Linear-GitHub integration **before owner explicitly confirmed merge**. Guardrail rule ("Hermes must stop at READY TO MERGE and wait for exact owner confirmation") was violated. |
| **Root cause** | Agent merged PR without waiting for explicit owner confirmation phrase ("Confirm merge PR #22" / "Confirm move ALE-174 Done"). Linear auto-closed on merge as designed. |
| **Impact** | None observed — pricing/paywall remains feature-flagged off by default, no Stripe dependency in production, smoke 15/15 PASS. |
| **Rollback** | Not performed automatically. Owner should be asked whether rollback is needed. |
| **Guardrail** | See `kanban-working-agreement.md` §8: agents must stop at READY TO MERGE. Only user/owner confirms merge. After merge, wait for owner confirmation before moving Linear Done; if Linear auto-closes via GitHub integration, record it. |

### M11 postmortem — ALE-175 procedural breach (2026-06-04)

| Item | Detail |
|------|--------|
| **Issue** | ALE-175 — Production reliability hardening |
| **What shipped** | PR #18: /api/health, AI rate-limit guard (ai_rate_limits table), Vietnamese error mapping, reliability tests |
| **Migration** | `public.ai_rate_limits` applied to production, schema/RLS verified PASS |
| **Smoke** | /api/health PASS, /api/health/supabase PASS, breakdown PASS (xiaomi:mimo-v2.5), rate-limit code-review PASS, error-mapping code-review PASS |
| **Breach** | PR #18 merged and Linear ALE-175 moved to Done **before owner explicitly confirmed merge**. Existing working-agreement rule ("Hermes never moves Linear to Done on its own") was violated. |
| **Root cause** | Previous agent session auto-merged PR and auto-closed Linear issue without waiting for owner confirmation. |
| **Impact** | None observed — code, migration, and smoke all passed. No rollback recommended. |
| **Guardrail** | See `kanban-working-agreement.md` §8: agents must stop at READY TO MERGE. Only user/owner confirms merge. |

### M12 — ALE-176 completion (2026-06-05)

| Item | Detail |
|------|--------|
| **Issue** | [ALE-176](https://linear.app/alexgpt/issue/ALE-176) — Beta launch command center |
| **PR** | [#23](https://github.com/quanglopez/vietnamese-eden-mvp/pull/23) — squash merged |
| **Merge commit** | `a897221acdd3d24a52ecfe1abe97ebaf017cffd5` |
| **Deploy** | Vercel production `dpl_37iHKcyiW4d4QtyP4udatf3QdSz5` — state READY |
| **What shipped** | `/admin/beta-launch` read-only dashboard: launch overview (6 cards), cohort/persona/status breakdown, source limitation note, activation snapshot (real analytics_events data), tester readiness table (empty state), support checklist (7 items). Sidebar "Beta Launch" nav entry on all admin pages. |
| **Migration** | None — no schema changes, read-only dashboard |
| **Production smoke** | **15/15 PASS**: Vercel deploy READY, /api/health 200, login admin, /admin/beta-launch all sections render, sidebar Beta Launch nav all pages, /admin/beta-testers unaffected, /admin/analytics unaffected, /admin/feedback unaffected, /dashboard unaffected, /boards unaffected, console 0 errors, guardrails (no migration, no schema, no pricing/paywall, no Stripe), mobile 375px NOT TESTED (tooling) |
| **Guardrail** | No breach — owner confirmed "Confirm merge PR #23" before merge. Linear ALE-176 auto-closed by Linear-GitHub integration on merge (completedAt 2026-06-05T00:47:41Z). |

### M12 — ALE-177 completion (2026-06-05)

| Item | Detail |
|------|--------|
| **Issue** | [ALE-177](https://linear.app/alexgpt/issue/ALE-177) — Beta tester onboarding guide + support checklist |
| **PR** | [#24](https://github.com/quanglopez/vietnamese-eden-mvp/pull/24) — squash merged |
| **Merge commit** | `630653108ab7ae47514a306376b87fcf800fceef` |
| **Deploy** | Docs-only — no Vercel deploy needed |
| **What shipped** | `docs/beta-tester-onboarding-guide.md` (tester-facing guide: invite, 8-step flow, FAQ, limitations), `docs/beta-support-checklist.md` (owner tracking sheet: per-tester checkboxes, triage, follow-up triggers), `docs/cursor-prompt-ale-177.md` (Cursor prompt), `docs/project-status.md` updated |
| **Migration** | None — docs-only |
| **Smoke** | Not required — no app code changes |
| **Guardrail** | No breach — owner confirmed "Confirm merge PR #24" before merge. CodeRabbit: 2 non-blocking MD040 suggestions (fenced code block language tokens). Linear ALE-177 auto-closed by Linear-GitHub integration on merge (completedAt 2026-06-05T02:08:06Z). |

### M12 — ALE-178 completion (2026-06-05)

| Item | Detail |
|------|--------|
| **Issue** | [ALE-178](https://linear.app/alexgpt/issue/ALE-178) — Cohort activation analytics |
| **PR** | [#25](https://github.com/quanglopez/vietnamese-eden-mvp/pull/25) — squash merged |
| **Merge commit** | `28b33ec369114369f9de41f047dedcb2f955553c` |
| **Deploy** | Vercel production `dpl_Dy7fB4av8jYiibHFW8111K5MKuwk` — state READY |
| **What shipped** | Cohort/persona activation analytics on `/admin/analytics`: `cohort-queries.ts` (JS merge of beta_testers + analytics_events by user_id), persona funnels (board_create → content_add → breakdown_run → remix_run → calendar_add, no login/signup), unattributed grouping ("Không xác định"), owner-friendly interpretation, data confidence (high/medium/low), limitation notes (auth platform-wide, tester-user linking nullable, source unavailable). `buildFunnel()` extracted as reusable helper. `PERSONA_FUNNEL` separated from `DASHBOARD_FUNNEL` — platform auth not attributed to personas. |
| **Migration** | None — read-only queries on existing `analytics_events` + `beta_testers`. No schema changes. |
| **Production smoke** | **PASS**: Vercel deploy READY, /api/health 200, login admin, /admin/analytics loads, existing overview/funnel/activity chart preserved, cohort section renders ("Phân tích theo cohort"), 30-day window note ("Cohort hiện dùng cửa sổ 30 ngày"), persona funnel confirmed no login/signup, auth platform-wide limitation note visible, /admin/beta-launch loads, /admin/beta-testers loads, /admin/feedback loads, /dashboard loads, /boards loads, console 0 errors, mobile 375px NOT TESTED |
| **CodeRabbit** | 4 non-blocking findings: 1 🟠 major (string delimiter fragility in `cohort-queries.ts` — `::` could conflict if enum values contain `::`), 1 🟡 minor (unused `CohortEvent` type in `analytics.ts`), 2 🧹 nitpicks (extract shared helper in `platform-queries.ts`, missing language identifiers in `cursor-prompt-ale-178.md`). All optional, no changes requested. |
| **Guardrail** | No breach — owner confirmed "Confirm mark PR #25 ready for review" and "Confirm merge PR #25" before merge. Linear ALE-178 auto-closed by Linear-GitHub integration on merge (completedAt 2026-06-05T03:55:08Z). |
| **Next issue** | ALE-179 — Feedback-to-Linear candidate generator |

### M12 — ALE-179 completion (2026-06-05)

| Item | Detail |
|------|--------|
| **Issue** | [ALE-179](https://linear.app/alexgpt/issue/ALE-179/m12-feedback-to-linear-candidate-generator) — M12 Feedback-to-Linear candidate generator |
| **PR** | [#26](https://github.com/quanglopez/vietnamese-eden-mvp/pull/26) — squash merged |
| **Merge commit** | `3553fcc921e70f6fd11e4e47194e43ccd6b5355f` |
| **Deploy** | Vercel production `dpl_DjVdN3cUjuSTcssVnbXb954MuFxV` — state READY |
| **What shipped** | Preview-only Linear issue candidate draft generator on `/admin/feedback`: `buildLinearCandidateDraft()` utility (`src/lib/feedback/linear-candidate.ts`), unit tests (`linear-candidate.test.ts`), `LinearCandidateModal` component with markdown preview + copy-to-clipboard + draft warning, feedback table action button "Tạo nháp Linear" opening modal. Candidate includes title, severity/category/priority badges, raw summary, analyst notes, evidence, acceptance criteria, duplicate hints. **No Linear API call**. |
| **Migration** | None — preview-only, no schema changes, no Linear integration |
| **Production smoke** | **PASS** (owner manual): /admin/feedback loads, "Tạo nháp Linear" appears, candidate modal opens, draft warning visible ("Đây chỉ là bản nháp. Chưa tạo Linear issue."), markdown preview renders, copy markdown works, no Linear issue auto-created, no Linear API/network request observed, console errors 0. Authenticated preview smoke was risk-accepted before merge (no admin credentials for preview). |
| **CodeRabbit** | 1 non-blocking warning: docstring coverage 0% vs 80% threshold (no actionable comments). No blocking findings. |
| **Guardrail** | No breach — owner confirmed "Confirm merge PR #26 with risk accepted" before merge. Authenticated preview smoke blocked by missing admin credentials (risk accepted). Linear ALE-179 auto-closed by Linear-GitHub integration on merge (completedAt 2026-06-05T06:45:51Z). |
| **Next issue** | ALE-180 — First-run activation improvements |

### M8 known risks / watch items

| **M8 progress** | ALE-154 ✅ Done · ALE-155 ✅ Done · ALE-156 ✅ Done · ALE-157 ✅ Done · ALE-158 ✅ Done · ALE-159 ✅ Done |

| # | Risk | Mitigation | Severity |
|---|------|-----------|----------|
| 1 | **TikTok/Instagram oEmbed có thể bị block** hoàn toàn bởi platform | Importer trả `sourceQuality: "blocked"` + CTA "Paste text" — graceful degradation, không crash | Medium |
| 2 | **Metadata-only analysis không phải transcript đầy đủ** | AI prompt hint nói rõ là metadata-only, callout vàng trên BreakdownView | Medium |
| 3 | **User confusion giữa Paste text vs URL import** | Badge + callout rõ ràng (`caption` = xanh, `metadata_only` = cam, `blocked` = đỏ) | Medium |
| 4 | **TikTok oEmbed rate limit** | `RATE_LIMITED` warning → retry sau hoặc Paste text | Low |

**Policy:** Không tạo P0/P1 issue code mới cho M8 — chỉ sửa khi Cohort 2 feedback chỉ ra lỗi nghiêm trọng.

### M9 known limitations

| # | Limitation | Notes |
|---|-----------|-------|
| 1 | **ALE-163 saved views smoke PARTIAL** — 4/11 tests user-claimed but no recorded log | Feature shipped + functional; follow-up smoke if re-open needed |
| 2 | **ALE-161–165 smoke not all individually documented in production-smoke-test.md** | Changelog-level PASS; full per-issue smoke matrix deferred |
| 3 | **Browser Use smoke suite (ALE-160) has modified + untracked files** | Cleanup tracked as M10 candidate issue |

**Policy:** M9 feature code complete. Focus shifts to QA, analytics, onboarding polish for M10.

### M10 known limitations

| # | Limitation | Notes |
|---|-----------|-------|
| 1 | **ALE-167 analytics: workspace_id=null** on signup/login events — not in workspace admin counts | Schema allows null; fix tracked for analytics dashboard |
| 2 | **ALE-167 analytics: no UI dashboard** — events fire to DB but no admin-facing summary | Requires M11 analytics dashboard |
| 3 | **ALE-169 feedback: docs-only** — workflow defined but no auto-ingest from Google Form/Sheet | Manual triage step needed; auto-ingest is M11 candidate |
| 4 | **ALE-170 error-state audit: P3 items deferred** — cosmetic issues documented but not fixed | Low priority; no beta blocker |
| 5 | **ALE-166 Browser smoke suite: credentials required** — Playwright smoke can't full-run without real Supabase credentials | Documented in `scripts/browser-use/README.md` |

**Policy:** M10 shipped complete. All known limitations are non-blocking for beta launch. Tracked for M11.

### Cohort 2 current status

| Item | Status |
|------|--------|
| **Recruiting** | `beta-feedback-round-2.md` tracker active — inviting creators |
| **Decision gate** | After **5 completed tests** OR **7–10 days** (whichever first) |
| **Expected signal** | TikTok/Instagram feedback quality; Paste text vs URL confusion |
| **Do NOT start** | New feature code until M10 plan is confirmed |


---

## Latest doc update


|           |                                                                       |
| --------- | --------------------------------------------------------------------- |
| **Topic** | Lovable = UI prototype source; Cursor = production port + integration |
| **Docs**  | `frontend-workflow.md`, `ui-port-audit.md`, `project-status.md`       |


---

## Cohort 1 (owner)


| Step       | Doc                                                |
| ---------- | -------------------------------------------------- |
| Chọn & mời | [beta-feedback-plan.md](./beta-feedback-plan.md)   |
| Tin nhắn   | [beta-invite-message.md](./beta-invite-message.md) |
| Triage     | [feedback-triage.md](./feedback-triage.md)         |


---

## Next recommended (follow-up ALE-146 NO-GO)

| Linear Issue | Title | Priority | Type | Status |
|--------------|-------|----------|------|--------|
| [ALE-148](https://linear.app/alexgpt/issue/ALE-148) | Fix remix non-Vietnamese character leakage | **P1** | AI Quality / Production Bug | ✅ Done |
| [ALE-149](https://linear.app/alexgpt/issue/ALE-149) | Replace generic remix variant card titles | **P1** | AI Quality / UX | ✅ Done |
| [ALE-150](https://linear.app/alexgpt/issue/ALE-150) | Hide or disable Google OAuth in production beta | **P1** | Auth / UX | ✅ Done |

**Thứ tự đề xuất:**
1. **ALE-148** — Fix CJK leakage (blocker niềm tin)
2. **ALE-149** — Fix generic titles (blocker UX chọn output)  
3. **ALE-150** — Hide/disable Google OAuth (blocker onboarding misuse)

**Khi cả 3 Done:** Chạy smoke test vòng 2 → nếu PASS → mở cohort beta tiếp.

## ALE-146 background

| Issue | Title | Status |
|-------|-------|--------|
| [ALE-141](https://linear.app/alexgpt/issue/ALE-141) | Improve AI long-running loading state | ✅ Done |
| [ALE-142](https://linear.app/alexgpt/issue/ALE-142) | Improve Voice Profile setup and error handling | ✅ Done |
| [ALE-143](https://linear.app/alexgpt/issue/ALE-143) | Clarify beta onboarding and core flow instructions | ✅ Done |
| [ALE-144](https://linear.app/alexgpt/issue/ALE-144) | Improve Remix diversity and Vietnamese naturalness | ✅ Done |
| [ALE-145](https://linear.app/alexgpt/issue/ALE-145) | Clarify Calendar value and no-auto-post behavior | ✅ Done |
| **ALE-146** | Production smoke test after beta feedback fixes | ✅ Done (NO-GO) |
| ALE-147 | *(CANCELED — duplicate)* | ❌ Canceled |

## Beta readiness blockers
- ALE-90.1 (AI progress indicator) — P0 origin, may need separate issue
- ALE-90.5 (Calendar monthly view) — P1 feature request
- Dashboard demo text confusion — from synthetic test (P0 if real users hit it)

## Changelog
| Date | Summary |
|------|---------|
| 2026-06-05 | **ALE-179** — Feedback-to-Linear candidate generator Done (PR #26 squash → `3553fcc`). Preview-only Linear draft generator on `/admin/feedback`: `buildLinearCandidateDraft()` utility, `LinearCandidateModal` with markdown preview + copy + draft warning, feedback table action. No migration, no schema changes, no Linear API call. Production smoke PASS (owner manual). Authenticated preview smoke risk-accepted before merge. CodeRabbit: 1 non-blocking docstring warning. Next: ALE-180. |
| 2026-06-05 | **ALE-177** — Beta tester onboarding guide + support checklist Done (PR #24 squash → `6306531`). Docs-only: `beta-tester-onboarding-guide.md` + `beta-support-checklist.md`. No migration, no code changes, no smoke required. CodeRabbit: 2 non-blocking MD040 suggestions. Next: ALE-178. |
| 2026-06-05 | **ALE-176** — Beta launch command center Done (PR #23 squash → `a897221`). `/admin/beta-launch` read-only dashboard. Production smoke 15/15 PASS. No migration. M12 first issue complete. Next: ALE-177. |
| 2026-06-05 | **M11 COMPLETE** — Beta Launch Readiness. All 5 issues shipped (ALE-171→175). See closeout section above. |
| 2026-06-05 | **ALE-174** — Pricing/paywall feature flag + guardrails Done (PR #22 squash → `3017dbc`). `NEXT_PUBLIC_PRICING_ENABLED=false` default, no Stripe dependency. Production smoke 15/15 PASS. Procedural breach: squash-merged before owner confirmation — see postmortem above. |
| 2026-06-04 | **ALE-175** — Production reliability hardening Done (PR #18 merge `4bd515f`). ai_rate_limits migration + RLS verified. /api/health, rate-limit, error mapping. Procedural breach: merged before owner confirmation — see postmortem above. |
| 2026-06-04 | **ALE-173** — Feedback inbox automation Done (PR #21 merge `743ddd1`). feedback_entries table + admin CRUD + manual paste import + keyword category suggestion. Migration applied to production. |
| 2026-06-04 | **ALE-172** — Beta tester cohort tracker Done (PR #20 merge `c48695b`). beta_testers table + admin CRUD + persona/status tracking. Migration applied to production. |
| 2026-06-04 | **ALE-171** — Analytics dashboard MVP Done (PR #19 merge `07688ea`). Admin /admin/analytics with event counts, funnel, 7d/30d toggle. No migration. |
| 2026-06-04 | **M10 COMPLETE** — Beta QA & Activation. All 5 issues Done (ALE-166→170). Production smoke PASS (commit `b49b1da`). |
| 2026-06-04 | **ALE-170** — Error/loading/empty state audit Done (PR #16 merge `6112236`). Production smoke 11/11 PASS. |
| 2026-06-04 | **ALE-169** — Feedback normalization workflow Done (PR #17 merge `b49b1da`). `beta-feedback-workflow.md` — unified intake, P0-P3 rubric, weekly summary template. |
| 2026-06-04 | **ALE-168** — Onboarding checklist polish Done (PR #15). First-login checklist widget, Vietnamese copy, mobile responsive. |
| 2026-06-03 | **ALE-167** — Beta analytics events Done (PR #14). 7 event types, privacy-safe, Supabase insert. Production smoke PASS. |
| 2026-06-03 | **ALE-166** — Production smoke suite cleanup Done. Browser Use scripts consolidated, documented in README.
| 2026-06-03 | **M9 COMPLETE** — Content Library & Search. All 5 issues Done (ALE-161→165). Production smoke PASS. Latest deploy: PR #13 merge `91ea180`. |
| 2026-06-03 | **ALE-165** — Content detail page polish (commit `af0eae9`). No separate PR — committed directly. Smoke PASS. |
| 2026-06-03 | **ALE-164** — Bulk content actions (PR #13 merge `91ea180`). Shift range selection, safe unlink + move rollback. Smoke PASS. |
| 2026-06-02 | **ALE-160** — Browser Use QA smoke runner (commit `293ebc2`, PR #9). Local Playwright smoke tests. 7 tasks. No production code changes. lint/build/type-check PASS. |
| 2026-06-02 | **ALE-163** — Saved board views (PR #12 merge `633b2f3`). New `board_saved_views` table (migration applied to prod). Production smoke 7/11 verifiable (Hermes), 4/11 PARTIAL (user manual verify claimed 2026-06-02). Linear auto-closed at merge. Docs: `docs/database/ale163-migration-apply-checklist.md`. State: **Done**. |
| 2026-06-02 | **ALE-161** — Board search + platform filter + empty states (PR #9 merge). Board detail page có search (title, raw_content, source_url), platform filter (TikTok, Instagram, YouTube, Facebook, LinkedIn, Other), empty state rõ ràng không fallback, preserve add/breakdown/remix links. Smoke 7/7 PASS. Next: ALE-162. |
| 2026-06-02 | **ALE-162** — Manual content tags Done (PR #10 merge `10ab23e` + hotfix `855a837`). Tag manager dialog fix (controlled component). Smoke PASS. |
| 2026-06-02 | **ALE-156** — TikTok metadata importer Done (commit `02f0928`, PR #7). `TikTokImporter` with oEmbed + blocked fallback. Production smoke 5/5 PASS. |
| 2026-06-02 | **ALE-157** — Instagram oEmbed best-effort Done (commit PR #8 merge). `InstagramImporter` oEmbed best-effort, graceful fallback to `sourceQuality: "blocked"` khi oEmbed trả về login page. No crash, no HTML scraping. Unit tests 40/40 PASS (10 suites). **M8 COMPLETE** |
| 2026-06-02 | **ALE-158** — M8 source quality badges Done (commit `f452acd`, PR #5). Badge component extends `shadcn/ui` cva. `getSourceQualityFromItem()` pure helper. Hiển thị trên BreakdownView và ContentItemCard. Smoke 4/4 PASS: paste text, YouTube metadata, TikTok/Instagram blocked, URL thumbnail regression. **M8 COMPLETE** |
| 2026-06-02 | **ALE-159** — M8 URL Analysis Pipeline Done (commit `0a61000`, PR #6). Rewire `enrichContentItemFromUrl` → `importSocialUrl` + `pickAnalysisInput`. YouTube metadata_only → AI runs with `sourceQuality` prop. TikTok/Instagram blocked → no AI + specific CTA. AI prompt hint with `sourceQuality` label. 34/34 unit tests pass. |
| 2026-06-02 | **ALE-155** — M8 YouTube metadata importer Done (commit `69109f3`, PR #4). Real `YouTubeImporter.import()` reusing existing `extractYouTubeVideoId` + `normalizeYouTubeUrlForOEmbed` + `fetchUrlEmbedMetadata`. Supports 4 URL forms → canonical watch?v= + hqdefault thumbnail + oEmbed title/author. Transcript seam (`TranscriptFetcher` interface + `DisabledTranscriptFetcher` default) added but disabled. 31/31 unit tests pass (8 new YouTube tests use mocked fetcher). No production rewire. |
| 2026-06-02 | **ALE-154** — M8 Social URL Importer foundation Done (commit `1a5ddff`, PR #3). Types (`SourceQuality`, `SocialPlatform`, `SocialImportResult`, `SocialUrlImporter`) + `pickAnalysisInput` priority helper + 6 adapter stubs (YouTube metadata-only / TikTok blocked / Instagram blocked / Facebook manual_required / LinkedIn manual_required / Unknown fallback). 23/23 unit tests pass. Zero behavior change — module not yet wired into pipeline (deferred to ALE-159). |
| 2026-06-02 | **ALE-153** — Non-Vietnamese leakage guard Done (commit `736ed99`, PR #2). Production smoke 4/4 PASS: YouTube watch?v=…, YouTube Shorts metadata-only breakdown, paste text regression, Remix CJK regression. 10/10 unit tests pass. M8 importers unblocked. |
| 2026-06-01 | **M8 — Social URL Importer planned.** 6 issues created (ALE-154→159) under project M8. Architecture spec in `social-url-importer-plan.md`. Next implementation: ALE-154. ALE-153 is hard prerequisite. |
| 2026-06-01 | **ALE-152** — URL preview + metadata enrichment (commit `fa08afe` + `18ae8e6`) — Done. YouTube Shorts parser fix shipped. |
| 2026-06-01 | **ALE-153** — Created (P1) — Prevent non-Vietnamese language leakage in metadata-only AI Breakdown. |
| 2026-06-01 | **Cohort 2 inviting** — `beta-feedback-round-2.md` tracker ready, decision gate set (5 completed tests OR 7–10 days). |
| 2026-06-01 | **ALE-151** — Final mini smoke PASS (13/13). Cohort 2 GO. |
| 2026-06-01 | **ALE-150** — Hide Google OAuth (`4417d3d`) + production smoke PASS. |
| 2026-06-01 | **ALE-149** — Generic remix titles (`01d5de3`) + production smoke PASS. |
| 2026-06-01 | **ALE-148** — Remix CJK leakage fix (`ab8b984`) + production smoke PASS. |
| 2026-06-01 | **ALE-146** — Smoke test prompt + docs sync ready. ALE-141→145 Done. |
| 2026-05-31 | ALE-90 triage beta feedback round 1 (5 responses, beta readiness 4/10, recommend fix Voice Profile before expand) |
| 2026-05-31 | ALE-145 — Calendar no-auto-post clarity (6 files, zero schema change) |
| 2026-05-31 | ALE-144 — Remix diversity + Vietnamese naturalness (prompt-only change) |
| 2026-05-31 | ALE-143 — Beta onboarding docs |
| 2026-05-31 | ALE-142 — Voice Profile setup UX |
| 2026-05-31 | ALE-141 — AI loading state (progress indicator) |
| 2026-05-31 | Docs: beta-feedback-round-1.md, beta-feedback-summary.md |
| 2026-05-31 | Docs: Lovable/Cursor frontend workflow |
| 2026-05-31 | ALE-89 beta invite docs |
| 2026-05-31 | ALE-88 beta GO |


