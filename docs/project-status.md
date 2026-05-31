# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-05-31 (docs: Lovable frontend role)  
**Production:** [https://vietnamese-eden-mvp.vercel.app/](https://vietnamese-eden-mvp.vercel.app/)  
**Commit:** `4a0e47f` on `main`

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


| Phase                    | Status                   |
| ------------------------ | ------------------------ |
| Core MVP on production   | **Ready** (ALE-88)       |
| Onboarding + limitations | **Ready**                |
| Inviting first cohort    | **In progress** (ALE-89) |
| Feedback triage round 1  | **Done** — ALE-90 ✅ |


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

## Next recommended

**ALE-91** — Fix P0/P1 bugs before expanding beta cohort.

| Linear Issue | Title | Priority |
|--------------|-------|----------|
| [ALE-141](https://linear.app/alexgpt/issue/ALE-141) | ALE-90A — Improve AI long-running loading state | P1 (P0 origin) |
| [ALE-142](https://linear.app/alexgpt/issue/ALE-142) | ALE-90B — Improve Voice Profile setup and error handling | P1 (P0 origin) |
| [ALE-143](https://linear.app/alexgpt/issue/ALE-143) | ALE-90C — Clarify beta onboarding and core flow instructions | P2 |
| [ALE-144](https://linear.app/alexgpt/issue/ALE-144) | ALE-90D — Improve Remix diversity and Vietnamese naturalness | P2 |
| [ALE-145](https://linear.app/alexgpt/issue/ALE-145) | ALE-90E — Clarify Calendar value and no-auto-post behavior | P2 |

**Thứ tự làm:** ALE-141 → ALE-142 → ALE-143 → ALE-144 → ALE-145

## Changelog

| Date       | Summary                                |
| ---------- | -------------------------------------- |
| 2026-05-31 | ALE-90 triage beta feedback round 1 (5 responses, beta readiness 4/10, recommend fix Voice Profile before expand) |
| 2026-05-31 | Docs: beta-feedback-round-1.md, beta-feedback-summary.md |
| 2026-05-31 | Docs: Lovable/Cursor frontend workflow |
| 2026-05-31 | ALE-89 beta invite docs                |
| 2026-05-31 | ALE-88 beta GO                         |


