# Project status — Vietnamese Eden MVP

**Cập nhật:** 2026-05-31 (ALE-88 beta readiness)  
**Production:** https://vietnamese-eden-mvp.vercel.app/  
**Commit:** `8dfae12` on `main`

---

## Beta readiness — GO for 10–20 users

| Scope | Status |
|-------|--------|
| Landing + waitlist | **Ready** |
| Auth (signup/login) | **Ready** |
| Workspace → board → content | **Ready** |
| P0 RLS | **Cleared** |
| AI Breakdown (Xiaomi) | **Ready** |
| Remix 5–10 variants | **Ready** (10 slower; see limitations) |
| Voice + Calendar | **Ready** |
| Beta docs | **Ready** — [beta-onboarding.md](./beta-onboarding.md), [known-limitations.md](./known-limitations.md) |

---

## Latest issue

| | |
|--|--|
| **ALE-88** | Beta readiness hardening — prod smoke + mobile 375 + latency notes + onboarding docs |
| **Outcome** | No code change; docs + verification |

---

## AI (production)

`AI_PROVIDER=xiaomi`, `AI_MODEL=mimo-v2.5`, `XIAOMI_*` on Vercel.

---

## Known P2 (non-blocking beta)

| Item | Doc |
|------|-----|
| Forgot-password email with `+` | [known-limitations.md](./known-limitations.md) |
| Google OAuth not enabled on Cloud | same |
| Remix/calendar minor H-scroll @ 375px | ALE-88 smoke |
| Local build OOM on low-RAM agents | Vercel OK; `NODE_OPTIONS=--max-old-space-size=8192` works |

---

## Verify (ALE-88)

| Command | Result |
|---------|--------|
| `npm run lint` | **PASS** |
| `npm run type-check` | **PASS** |
| `npm run build` | **PASS** (8GB heap) |

---

## Next recommended

- **ALE-89**: Invite beta cohort + feedback template; optional Playwright smoke in CI.
- Monitor Xiaomi cost at 10 variants/user/day.

---

## Changelog

| Date | Issue | Summary |
|------|-------|---------|
| 2026-05-31 | ALE-88 | Beta GO; onboarding + limitations docs |
| 2026-05-31 | ALE-87 | Remix JSON hardening |
| 2026-05-31 | ALE-86 | Xiaomi prod verified |
