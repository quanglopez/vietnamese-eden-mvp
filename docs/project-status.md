# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-05-31 (docs: Lovable frontend role)  
**Production:** https://vietnamese-eden-mvp.vercel.app/  
**Commit:** `4a0e47f` on `main`

---

## Stack & repos

| Layer | Công nghệ / repo |
|-------|------------------|
| **UI prototype** | **Lovable** + TanStack Start — `C:\Users\ADMIN\s-ng-t-o-vi-t` (mock UI, không deploy) |
| **Production app** | **Next.js 14** App Router — `C:\Users\ADMIN\vietnamese-eden-mvp` |
| **Port & backend** | **Cursor** — port UI từ Lovable prototype, Supabase, auth, AI, deploy Vercel |
| **Database / auth** | Supabase (Postgres + RLS + Auth) |
| **AI (production)** | Xiaomi MiMo V2.5 (`AI_PROVIDER=xiaomi`, `mimo-v2.5`); OpenAI fallback trong code |

**Frontend workflow:** [frontend-workflow.md](./frontend-workflow.md) · **UI audit:** [ui-port-audit.md](./ui-port-audit.md)

---

## Beta readiness

| Phase | Status |
|-------|--------|
| Core MVP on production | **Ready** (ALE-88) |
| Onboarding + limitations | **Ready** |
| Inviting first cohort | **In progress** (ALE-89) |
| Feedback triage round 1 | **Next** — ALE-90 |

---

## Latest doc update

| | |
|--|--|
| **Topic** | Lovable = UI prototype source; Cursor = production port + integration |
| **Docs** | `frontend-workflow.md`, `ui-port-audit.md`, `project-status.md` |

---

## Cohort 1 (owner)

| Step | Doc |
|------|-----|
| Chọn & mời | [beta-feedback-plan.md](./beta-feedback-plan.md) |
| Tin nhắn | [beta-invite-message.md](./beta-invite-message.md) |
| Triage | [feedback-triage.md](./feedback-triage.md) |

---

## Next recommended

**ALE-90** — Triage beta feedback round 1.

---

## Changelog

| Date | Summary |
|------|---------|
| 2026-05-31 | Docs: Lovable/Cursor frontend workflow |
| 2026-05-31 | ALE-89 beta invite docs |
| 2026-05-31 | ALE-88 beta GO |
