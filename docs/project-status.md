# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-06-01 (ALE-146 production smoke)  
**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)  
**Commit:** `7185b51` on `main` (smoke tested); docs commit pending push

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
| Inviting next cohort | **BLOCKED** — fix ALE-148→150 trước |


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
| [ALE-148](https://linear.app/alexgpt/issue/ALE-148) | Fix remix non-Vietnamese character leakage | **P1** | AI Quality / Production Bug | 🔄 Todo |
| [ALE-149](https://linear.app/alexgpt/issue/ALE-149) | Replace generic remix variant card titles | **P1** | AI Quality / UX | 🔄 Todo |
| [ALE-150](https://linear.app/alexgpt/issue/ALE-150) | Hide or disable Google OAuth in production beta | **P1** | Auth / UX | 🔄 Todo |

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


