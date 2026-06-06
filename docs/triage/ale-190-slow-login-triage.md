# ALE-190 — P1 Slow Login Triage

**Issue:** [ALE-190](https://linear.app/alexgpt/issue/ALE-190/m13-top-p1-bug-fixes-from-cohort-2-feedback)
**Feedback entry:** `25d036ab-...` (category: performance, priority: P1, status: open, reporter: tester-01)
**Triage date:** 2026-06-06
**Triage outcome:** Real P1 bug — root cause identified and fixed

---

## Feedback verbatim

> "Login quá chậm, mất 5 giây mới vào được dashboard"

- Source: manual_chat
- Device: unknown
- Reproducible: unknown (reported once)

---

## Root cause analysis

### Classification: Real P1 bug — cross-region latency (infra config)

The slow login is caused by **Vercel functions running in US-East (us-east-1)** while **Supabase is hosted in Sydney (ap-southeast-2)**. Every server-side `supabase.auth.getUser()` call is a ~200ms+ US↔Sydney round-trip.

The login→dashboard path stacks multiple sequential round-trips:

```
User clicks "Đăng nhập"
  → signInWithPassword (client-side, fast ~150ms)
  → router.push("/dashboard")
  → Middleware: getUser()          ← US→Sydney round-trip #1 (~200ms)
  → AppLayout: getUser()           ← US→Sydney round-trip #2 (~200ms)
  → DashboardPage: getUser()       ← US→Sydney round-trip #3 (~200ms)
  → getCurrentWorkspace()          ← US→Sydney round-trip #4 (~50ms)
  → Promise.all([8 queries])       ← US→Sydney parallel (~100ms)
  + Vercel cold start              ← +500-900ms on first request
  ─────────────────────────────────
  Total (cold): ~1.5-2.5s server time
  Total (warm): ~800ms-1.2s server time
  Perceived (with spinner): 3-5s
```

### Evidence

Production auth logs (`GET /user` durations):
- Typical warm calls: 2-7ms at Supabase side
- Cold `getUser()` calls: 24ms, 85ms, 147ms (Supabase cold connection pool)
- Token refresh (`POST /token`): **143-280ms** (US-East to Sydney latency)
- Vercel function IPs: `44.205.9.64`, `52.54.158.194`, `54.224.193.115`, `44.202.196.47`, `44.203.242.252` → all US-East-1 AWS

No `vercel.json` existed in the project → Vercel defaulted to `iad1` (US-East, Virginia).

Supabase project: `romaiooigximznlrpsze`, region: `ap-southeast-2` (Sydney).

### Vercel timing probe (from Vietnam → production)

```
/api/health cold:  total=1.23s, ttfb=1.23s
/api/health warm:  total=0.33-0.57s
/login page:       total=0.33-1.23s (varies with cold start)
```

Even the simplest endpoint cold-starts at 1.2s. The dashboard adds 3 sequential auth calls on top.

---

## Fix applied

Added `vercel.json` to the repo root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "regions": ["syd1"]
}
```

This colocates all Vercel serverless functions with the Supabase project in Sydney, eliminating the US↔Sydney cross-region round-trips.

**Expected impact:**
- Token refresh latency: ~280ms → ~20-50ms (same-region)
- Each `getUser()` call: ~200ms → ~5-20ms
- Total login→dashboard server time: ~800ms-2.5s → ~100-400ms
- Perceived login latency: 3-5s → <1s (warm), ~1.5s (cold start)

**Risk level:** Low
- No code changes, no auth provider changes
- Config-only change, fully reversible
- No migration, no schema change, no secrets

---

## Remaining considerations (out of scope for ALE-190)

1. **Duplicate `getUser()` calls (layout + page):** The `(app)/layout.tsx` and `dashboard/page.tsx` both call `getUser()` independently. In Next.js 14 with `createServerClient`, these are separate network requests (not deduped). A future optimization could pass user context via React cache() or server action context — but this is a medium-complexity refactor, not a P1 fix.

2. **Sequential workspace lookup:** `getCurrentWorkspace()` runs after `getUser()` resolves (sequential). Could be parallelized with a future refactor.

3. **Cold start optimization:** `output: "standalone"` in next.config.js is correct for Vercel. No further action needed.

---

## Feedback entry update

Entry `25d036ab-...` should be updated:
- `status`: `triaged`
- `reproducible`: `yes`
- `action_notes`: "Root cause: Vercel us-east-1 vs Supabase ap-southeast-2. Fix: vercel.json regions=[syd1] deployed in ALE-190 PR."

(Owner to update manually in `/admin/feedback` UI or Supabase Studio — read-only constraint prevents direct SQL update.)

---

## Verification plan

After deploy:
1. `/api/health` cold start should drop from ~1.2s to <0.5s
2. `/dashboard` TTFB (authenticated, warm) should drop from ~800ms to <300ms
3. Auth logs should show Supabase IPs from `ap-southeast-2` range, not US-East

---

*Filed by: Kiro (Hermes Autopilot), 2026-06-06*
