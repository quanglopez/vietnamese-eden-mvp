# Project status — Vietnamese Eden MVP

**Mục đích:** Snapshot ngắn để ChatGPT / agent mới nắm tình hình nhanh.  
**Cập nhật lần cuối:** 2026-05-31 (ALE-85 production retest)  
**Repo:** `C:\Users\ADMIN\vietnamese-eden-mvp`  
**Cách cập nhật:** [status-update-template.md](./status-update-template.md)

---

## At a glance

| Field | Value |
|-------|--------|
| **Production URL** | https://vietnamese-eden-mvp.vercel.app/ |
| **GitHub** | https://github.com/quanglopez/vietnamese-eden-mvp |
| **Stack** | Next.js 14, TypeScript, Tailwind, shadcn/ui, Supabase, AI (OpenAI on prod today) |
| **Linear** | Source of truth (team Alexgpt) |

---

## Latest completed verification

| | |
|--|--|
| **Issue** | **ALE-85** — Production retest (RLS policies confirmed + full MVP flow) |
| **Outcome** | **P0 RLS cleared** on production (workspace → board → content). **AI FAIL** — OpenAI 500 on breakdown + voice. Remix/calendar **NOT RUN**. |
| **Docs** | [production-smoke-test.md](./production-smoke-test.md) — § ALE-85 |

---

## Beta readiness

| Scope | Status |
|-------|--------|
| Landing + waitlist + auth | **Ready** |
| Workspace → board → add content | **Ready** (ALE-85 retest PASS) |
| **P0 RLS** (`profiles_insert_own`, `workspaces_select_owner`) | **Cleared** — policies exist on Cloud; retest không lỗi RLS |
| AI breakdown / remix / voice / calendar E2E | **Not ready** — OpenAI `internal_error` (500) on production |

**Verdict:** Beta **marketing + auth + data entry (workspace/board/content)** OK. Beta **full AI MVP** **not ready** until AI provider works on Vercel (Xiaomi deploy hoặc OpenAI fix).

---

## Open blockers

| Priority | Blocker | Action |
|----------|---------|--------|
| ~~**P0**~~ | ~~Workspace RLS~~ | **Cleared** (ALE-84 migration + ALE-85 retest) |
| **P1** | OpenAI 500 on breakdown + voice | Deploy Xiaomi provider **hoặc** fix `OPENAI_API_KEY` / quota / model trên Vercel |
| **P1** | Remix / calendar E2E | Retest sau AI OK |
| P2 | Forgot-password với email `+` | Dùng email không `+` |

---

## In progress (code, not yet on production)

| | |
|--|--|
| **ALE-85/86** | AI provider abstraction (`mock` \| `openai` \| `xiaomi`) — local repo; **chưa verify** trên production URL |

---

## Supabase Cloud migrations

1. `20260530120000_health_check.sql` — applied  
2. `20260530130000_initial_schema.sql` — applied  
3. `20260531120000_beta_waitlist.sql` — applied  
4. `20260531140000_workspace_owner_select.sql` — applied; policies **confirmed** on Cloud (ALE-85)

---

## Next recommended steps

1. **Owner:** Vercel — deploy latest `main` + set `AI_PROVIDER=xiaomi`, `XIAOMI_API_KEY`, `XIAOMI_BASE_URL`, `AI_MODEL=mimo-v2.5`, `AI_USE_MOCK=false` (hoặc fix OpenAI).
2. Retest production steps 6–10: breakdown → remix → calendar → voice.
3. Cập nhật smoke doc khi AI PASS.

**Rollback AI:** `AI_PROVIDER=openai` + valid `OPENAI_API_KEY`.

---

## Last verify commands

| Command | Result (2026-05-31) |
|---------|---------------------|
| Production Playwright retest | See ALE-85 in production-smoke-test.md |
| `curl …/api/health/supabase` | **ok** |

```bash
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

---

## Key docs map

| Doc | Dùng khi |
|-----|----------|
| [project-status.md](./project-status.md) | **Đọc đầu tiên** |
| [production-smoke-test.md](./production-smoke-test.md) | Chi tiết smoke / ALE-xx |
| [production-env.md](./production-env.md) | Vercel env (Xiaomi / OpenAI) |

---

## Changelog (status file)

| Date | Issue | Summary |
|------|-------|---------|
| 2026-05-31 | ALE-85 | Prod retest: RLS PASS; AI OpenAI 500; full MVP not ready |
| 2026-05-31 | ALE-84 | Migration applied; workspace/board PASS |
| 2026-05-31 | — | Khởi tạo project-status |
