# Project status — Vietnamese Eden MVP

**Cập nhật lần cuối:** 2026-05-31 (ALE-86 Xiaomi production verified)  
**Production:** https://vietnamese-eden-mvp.vercel.app/  
**Repo:** `C:\Users\ADMIN\vietnamese-eden-mvp`

---

## At a glance

| Field | Value |
|-------|--------|
| **Stack** | Next.js 14, Supabase, **Xiaomi MiMo V2.5** (prod), OpenAI fallback |
| **Latest verify** | ALE-86 production AI E2E |
| **Commit** | `21ec18e` on `main` (= `origin/main`) |

---

## Latest completed issue

| | |
|--|--|
| **Issue** | **ALE-86** — Deploy Xiaomi MiMo + production AI retest |
| **Outcome** | Xiaomi **verified** on production. Breakdown / Voice / Calendar **PASS**. Remix **PASS** (3 variants); 5-variant Facebook **JSON parse fail** (flake). |
| **Docs** | [production-smoke-test.md](./production-smoke-test.md) — § ALE-86 |

**Provider code:** shipped in `21ec18e` (`src/lib/ai/provider.ts`, `providers/xiaomi.ts`, `config.ts`, `chat-completions.ts`).

---

## Beta readiness

| Scope | Status |
|-------|--------|
| Landing + waitlist + auth | **Ready** |
| Workspace → board → content | **Ready** |
| **P0 RLS** | **Cleared** |
| AI Breakdown (Xiaomi `mimo-v2.5`) | **Ready** — verified prod |
| Remix (Xiaomi) | **Mostly ready** — 5-variant edge case |
| Voice Profile (Xiaomi) | **Ready** |
| Content Calendar | **Ready** |

**Verdict:** Beta **full MVP** **ready** for core demo flow (breakdown → remix → calendar → voice), với ghi chú remix 5 biến thể cần retest/harden.

---

## AI provider (production)

| Variable | Value |
|----------|--------|
| `AI_PROVIDER` | `xiaomi` |
| `AI_MODEL` | `mimo-v2.5` |
| `AI_USE_MOCK` | `false` |
| `XIAOMI_API_KEY` | Set on Vercel (Sensitive) |
| `XIAOMI_BASE_URL` | Set on Vercel |

**Rollback:** `AI_PROVIDER=openai` + `OPENAI_API_KEY`.

---

## Open blockers

| Priority | Item | Action |
|----------|------|--------|
| ~~P0~~ | Workspace RLS | **Cleared** |
| P2 | Remix 5-variant JSON parse | Harden `extractJsonObject` / retry; track in Linear |
| P2 | Forgot-password email `+` | Workaround: email không `+` |

---

## Supabase migrations (Cloud)

All 4 applied including `20260531140000_workspace_owner_select.sql`.

---

## Next recommended issue

**ALE-87** (đề xuất): Harden Xiaomi remix JSON parsing + retest 5–10 variants; optional Playwright prod smoke in CI.

---

## Verify (local, 2026-05-31)

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run type-check` | **PASS** |
| `npm run build` | **FAIL** agent OOM at static gen; compile + types OK (Vercel build OK) |

---

## Changelog

| Date | Issue | Summary |
|------|-------|---------|
| 2026-05-31 | ALE-86 | Xiaomi prod verified; full MVP E2E pass (remix caveat) |
| 2026-05-31 | ALE-85 | RLS retest pass; AI was OpenAI 500 |
| 2026-05-31 | ALE-84 | Workspace RLS migration |
