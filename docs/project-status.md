# Project status — Vietnamese Eden MVP

**Mục đích:** Snapshot ngắn để ChatGPT / agent mới nắm tình hình nhanh.  
**Cập nhật lần cuối:** 2026-05-31 (ALE-84)  
**Repo:** `C:\Users\ADMIN\vietnamese-eden-mvp`  
**Cách cập nhật:** Sau mỗi issue, copy [status-update-template.md](./status-update-template.md) → điền → merge vào các mục dưới.

---

## At a glance

| Field | Value |
|-------|--------|
| **Production URL** | https://vietnamese-eden-mvp.vercel.app/ |
| **GitHub** | https://github.com/quanglopez/vietnamese-eden-mvp |
| **Stack** | Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, OpenAI |
| **Linear** | Source of truth cho tasks (team Alexgpt) |

---

## Latest completed issue

| | |
|--|--|
| **Issue** | **ALE-84** — Workspace RLS migration + MVP production retest |
| **Outcome** | Migration **reviewed** + **on `main`** (`3153bd3`). Cloud apply **pending** (agent không apply được). Production probe: workspace vẫn **FAIL RLS**. MVP flow 8–19 **NOT RUN**. |
| **Docs** | [production-smoke-test.md](./production-smoke-test.md) — section ALE-84 (SQL Editor steps) |

**Issue trước:** **ALE-83** — E2E smoke documented P0 workspace blocker.

---

## Latest commit

| | |
|--|--|
| **SHA** | `3153bd3` |
| **Message** | `docs: add project status and workspace RLS migration` |
| **Branch** | `main` (= `origin/main`) |
| **Includes** | `supabase/migrations/20260531140000_workspace_owner_select.sql`, `docs/project-status.md`, `docs/status-update-template.md` |

---

## Beta readiness

| Scope | Status |
|-------|--------|
| Landing + pricing + waitlist | **Ready** |
| Signup / login (production) | **Ready** |
| Form validation (zod/v4 + forwardRef) | **Deployed** |
| Full MVP (board → AI → calendar) on production | **Not ready** — migration #4 chưa apply Cloud |

**Verdict:** Beta **marketing + auth** OK. Beta **full MVP** sau owner apply SQL migration #4 + retest PASS.

---

## Open blockers

| Priority | Blocker | Action |
|----------|---------|--------|
| **P0** | Migration `20260531140000_workspace_owner_select.sql` **chưa apply** Supabase Cloud | Owner: SQL Editor — chi tiết [production-smoke-test.md § ALE-84](./production-smoke-test.md) |
| **P1** | MVP E2E 8–19 chưa retest | Sau P0: signup → workspace → board → AI → calendar |
| **P1** | OpenAI E2E trên Vercel chưa verify | Sau có content item |
| P2 | Forgot-password + email addressing | Email test không dùng `+` |

**P0 còn?** **Có** — xác nhận bằng production test 2026-05-31.

---

## Supabase Cloud migrations (apply order)

1. `20260530120000_health_check.sql` — applied
2. `20260530130000_initial_schema.sql` — applied
3. `20260531120000_beta_waitlist.sql` — applied (ALE-82)
4. `20260531140000_workspace_owner_select.sql` — **PENDING** ← **owner action**

---

## Next recommended issue

**ALE-85** — Sau owner apply migration #4 trên Cloud:

1. Production retest full MVP (board → breakdown → remix → voice → calendar).
2. Cập nhật checklist ALE-84 trong `production-smoke-test.md`.
3. Cập nhật file này: P0 cleared, beta readiness full MVP.

---

## Last verify commands

| Command | Result (2026-05-31, ALE-84) |
|---------|------------------------------|
| `npm run lint` | **Skipped** — docs only |
| `npm run type-check` | **Skipped** — docs only |
| `npm run build` | **Skipped** — docs only |

**Production probe (Playwright):** workspace create → **FAIL** (RLS) — confirms migration not on Cloud yet.

```bash
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

---

## Key docs map

| Doc | Dùng khi |
|-----|----------|
| [project-status.md](./project-status.md) | **Đọc đầu tiên** |
| [status-update-template.md](./status-update-template.md) | Sau mỗi issue |
| [production-smoke-test.md](./production-smoke-test.md) | Smoke / ALE-84 SQL steps |
| [supabase-cloud-setup.md](./supabase-cloud-setup.md) | Cloud setup |
| [demo-script.md](./demo-script.md) | Demo flow |

---

## Changelog (status file)

| Date | Issue | Summary |
|------|-------|---------|
| 2026-05-31 | ALE-84 | Migration on main; Cloud apply pending; SQL Editor guide; MVP retest blocked |
| 2026-05-31 | — | Khởi tạo `project-status.md` + template (post ALE-83) |
