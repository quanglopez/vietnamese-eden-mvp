# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-05-31 (ALE-87 remix JSON hardening)  
**Production:** https://vietnamese-eden-mvp.vercel.app/  
**Commit:** `0bfe448` on `main`

---

## Latest completed

| | |
|--|--|
| **Issue** | **ALE-87** — Harden JSON parsing for Xiaomi remix |
| **Outcome** | Remix **5 biến thể Facebook** PASS on production after deploy |
| **Docs** | [production-smoke-test.md](./production-smoke-test.md) — § ALE-87 |

---

## Beta readiness

| Scope | Status |
|-------|--------|
| P0 RLS | **Cleared** |
| Auth + waitlist + workspace/board/content | **Ready** |
| AI Breakdown (Xiaomi `mimo-v2.5`) | **Ready** |
| Remix 5-variant (Xiaomi) | **Ready** (ALE-87) |
| Voice Profile | **Ready** |
| Calendar | **Ready** |

**Verdict:** Beta **full MVP core flow** **ready** for external testers.

---

## AI provider (production)

`AI_PROVIDER=xiaomi`, `AI_MODEL=mimo-v2.5`, `XIAOMI_*` on Vercel. OpenAI fallback in code.

---

## Open blockers

| Priority | Item |
|----------|------|
| P2 | Forgot-password email with `+` |
| — | Local `npm run build` OOM on agent machine; Vercel build OK |

---

## Next recommended

- **ALE-88** (optional): Playwright production smoke script in CI; mobile 375px pass.
- Monitor Xiaomi remix latency/cost at 10 variants.

---

## Verify (ALE-87)

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run type-check` | **PASS** |
| `npm run build` (local) | **FAIL** OOM static gen; compile + types OK |
