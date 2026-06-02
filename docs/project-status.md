# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-06-02 (ALE-158 Done — M8 source quality badges shipped)
**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)
**Latest deploy:** commit `f452acd` on `main` (ALE-158 Done)
**Mục tiêu tiếp theo:** [ALE-159](https://linear.app/alexgpt/issue/ALE-159) — URL Analysis Pipeline using best available source (M8 final)
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
| **M8 milestone** | **Done** — pipeline shipped (ALE-154, ALE-155, ALE-156, ALE-158, ALE-159) | [social-url-importer-plan.md](./social-url-importer-plan.md) |
| **Next implementation issue** | [ALE-159](https://linear.app/alexgpt/issue/ALE-159) — URL Analysis Pipeline using best available source (M8 final) |
| **ALE-153 prerequisite** | ✅ [ALE-153](https://linear.app/alexgpt/issue/ALE-153) Done (commit `736ed99`, PR #2) — M8 importers unblocked |
| **M8 progress** | ALE-154 ✅ Done · ALE-155 ✅ Done · ALE-156 ✅ Done · ALE-158 ✅ Done · ALE-159 → Next · ALE-157 → Backlog |


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
| 2026-06-02 | **ALE-156** — TikTok metadata importer Done (commit `02f0928`, PR #7). `TikTokImporter` with oEmbed + blocked fallback. Production smoke 5/5 PASS. Next: ALE-157. |
| 2026-06-02 | **ALE-158** — M8 source quality badges Done (commit `f452acd`, PR #5). Badge component extends `shadcn/ui` cva với 6 source-quality variants (green/yellow/blue/orange/red). `getSourceQualityFromItem()` pure helper — heuristic mapping từ `rawContent`/`sourceUrl`/`platform` (không DB field). Hiển thị trên BreakdownView và ContentItemCard. Smoke 4/4 PASS: paste text, YouTube metadata, TikTok/Instagram blocked, URL thumbnail regression. Next: ALE-159. |
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


