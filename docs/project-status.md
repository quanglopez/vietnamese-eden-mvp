# Project status — Vietnamese Eden MVP

**Mục đích:** Snapshot ngắn để ChatGPT / agent mới nắm tình hình nhanh.  
**Cập nhật lần cuối:** 2026-05-31  
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
| **Issue** | **ALE-83** — Full MVP production E2E smoke test |
| **Outcome** | Landing, waitlist, signup, login, dashboard, mobile basic **PASS** trên production. Board → AI → calendar **NOT RUN** (blocked). |
| **Docs** | [production-smoke-test.md](./production-smoke-test.md) — section ALE-83 |

**Issue trước đó (scope ổn định):** **ALE-82** — Waitlist migration apply Cloud + retest waitlist/auth **PASS**.

---

## Latest commit

| | |
|--|--|
| **SHA** | `f2ae254` |
| **Message** | `docs: update production smoke test after waitlist migration` |
| **Branch** | `main` (synced with `origin/main` at last check) |

**Local chưa commit (nếu agent thấy trong `git status`):**

- `docs/production-smoke-test.md` — bổ sung ALE-83
- `supabase/migrations/20260531140000_workspace_owner_select.sql` — fix RLS workspace (mới)
- `supabase/README.md` — migration #4

---

## Beta readiness

| Scope | Status |
|-------|--------|
| Landing + pricing + waitlist | **Ready** |
| Signup / login (production) | **Ready** |
| Form validation (zod/v4 + forwardRef) | **Deployed** (`b045245`, `5f3f603`) |
| Full MVP (board → breakdown → remix → voice → calendar) | **Not ready** |

**Verdict:** Beta **công khai hạn chế** (marketing + auth). Beta **đầy đủ MVP** sau khi gỡ blocker workspace + retest E2E + AI.

---

## Open blockers

| Priority | Blocker | Action |
|----------|---------|--------|
| **P0** | Tạo workspace trên production: `new row violates row-level security policy for table "workspaces"` | Apply SQL migration #4: `supabase/migrations/20260531140000_workspace_owner_select.sql` trên Supabase Cloud (SQL Editor) |
| **P1** | MVP E2E steps 8–19 chưa chạy (phụ thuộc P0) | Retest theo [production-smoke-test.md](./production-smoke-test.md) sau fix |
| **P1** | `OPENAI_API_KEY` / AI breakdown-remix trên Vercel chưa verify E2E | Retest sau có board + content |
| P2 | Forgot-password: email có `+` bị Supabase recover reject | Dùng email test không `+`; hoặc cấu hình Auth provider |

---

## Supabase Cloud migrations (apply order)

1. `20260530120000_health_check.sql`
2. `20260530130000_initial_schema.sql`
3. `20260531120000_beta_waitlist.sql` — **applied** (ALE-82)
4. `20260531140000_workspace_owner_select.sql` — **pending** (ALE-83 fix)

Chi tiết: [supabase-cloud-setup.md](./supabase-cloud-setup.md), [supabase/README.md](../supabase/README.md).

---

## Next recommended issue

**ALE-84** (đề xuất — tạo trên Linear nếu chưa có):

1. Apply migration `20260531140000_workspace_owner_select.sql` trên Supabase Cloud.
2. Production retest: Tạo workspace → board → content → AI breakdown/remix → calendar.
3. Cập nhật `docs/production-smoke-test.md` + **file này** (`docs/project-status.md`).

---

## Last verify commands

| Command | Khi nào chạy | Last result (2026-05-31) |
|---------|----------------|---------------------------|
| `npm run lint` | Sau thay đổi code | Pass |
| `npm run type-check` | Sau thay đổi code | Pass |
| `npm run build` | Sau thay đổi code | Pass (local: `NODE_OPTIONS=--max-old-space-size=8192` nếu OOM) |
| — | **Chỉ docs** (lần cập nhật status này) | **Không chạy** — không đổi code |

**Production smoke (manual / Playwright):**

```bash
curl -s https://vietnamese-eden-mvp.vercel.app/api/health/supabase
```

---

## Key docs map

| Doc | Dùng khi |
|-----|----------|
| [project-status.md](./project-status.md) | **Đọc đầu tiên** — snapshot hiện tại |
| [status-update-template.md](./status-update-template.md) | Sau mỗi issue — cập nhật status |
| [production-smoke-test.md](./production-smoke-test.md) | Chi tiết pass/fail production theo ALE-xx |
| [deploy-checklist.md](./deploy-checklist.md) | Deploy Vercel / env |
| [supabase-cloud-setup.md](./supabase-cloud-setup.md) | Supabase Cloud + migrations |
| [demo-script.md](./demo-script.md) | Demo local / click-by-click |

---

## Changelog (status file)

| Date | Issue | Summary |
|------|-------|---------|
| 2026-05-31 | — | Khởi tạo `project-status.md` + `status-update-template.md` (post ALE-83) |
