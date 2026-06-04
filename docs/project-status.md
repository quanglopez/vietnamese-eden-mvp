# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-06-04 (M11 ALE-175 shipped — procedural postmortem below)
**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)
**Latest deploy:** commit `4bd515f` on main (ALE-175 PR #18 merged 2026-06-04)
**Mục tiếp theo:** M11 remaining issues + procedural guardrail enforcement
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
| **M11 progress** | ALE-175 ✅ Done (procedural postmortem below) · ALE-171→174 pending |

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
| **ALE-153 prerequisite** | ✅ [ALE-153](https://linear.app/alexgpt/issue/ALE-153) Done (commit `736ed99`, PR #2) — M8 importers unblocked |
| **M8 progress** | ALE-154 ✅ Done · ALE-155 ✅ Done · ALE-156 ✅ Done · ALE-157 ✅ Done · ALE-158 ✅ Done · ALE-159 ✅ Done |

### M8 known risks / watch items

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
| 2026-06-04 | **ALE-175** — Production reliability hardening Done (PR #18 merge `4bd515f`). ai_rate_limits migration + RLS verified. /api/health, rate-limit, error mapping. Procedural breach: merged before owner confirmation — see postmortem above. |
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


