# Cursor Prompt — ALE-175: Production Reliability Hardening

**Issue:** https://linear.app/alexgpt/issue/ALE-175
**Branch:** anh555056/ale-175-m11-production-reliability-hardening
**Status:** In Progress
**Created:** 2026-06-04

---

## Current Reliability State (Audit Results)

### 1. Health Endpoint

| File | What | Status |
|------|------|--------|
| `src/app/api/health/supabase/route.ts` | Supabase health via `health_check` table | ✅ Works, returns 503 on error |
| `src/lib/supabase/health-check.ts` | `runHealthCheckQuery()` helper | ✅ |
| `/api/health` root | Comprehensive health (app + supabase + AI) | ❌ DOES NOT EXIST |

### 2. AI Provider Error Handling

| Operation | File | Error Handling | Graceful Degradation |
|-----------|------|----------------|---------------------|
| Breakdown | `src/lib/content/analysis-actions.ts` | Catches `AiProviderError`, returns `error.message` | ❌ Raw error text dumped to user |
| Remix | `src/lib/content/remix-actions.ts` | Catches `AiProviderError`, returns `error.message` | ❌ Raw error text dumped to user |
| Voice | `src/lib/voice/actions.ts` | `mapVoiceAnalysisError()` with categorized messages | ✅ Has timeout/500/rate-limit messages |

### 3. Rate Limiting / Abuse Guard

| Layer | Status |
|-------|--------|
| Next.js middleware | ❌ DOES NOT EXIST (`middleware.ts` not present) |
| In-app rate limit | ❌ NONE |
| Per-user throttle | ❌ NONE |
| Vercel edge config | ❌ NONE (`vercel.json` not present) |

### 4. AI Provider Config

| File | Role |
|------|------|
| `src/lib/ai/config.ts` | `AI_PROVIDER` env → provider selection (mock/openai/xiaomi) |
| `src/lib/ai/provider.ts` | Factory: `getContentAnalysisProvider()`, `getRemixGeneratorProvider()`, `getVoiceAnalysisProvider()` |
| `src/lib/ai/providers/openai-compatible.ts` | `chatJsonCompletion()` → `fetch()` with error handling |
| `src/lib/ai/client.ts` | Public API: `analyzeContentText()`, `generateRemixVariants()`, `analyzeVoiceProfile()` |
| `src/lib/ai/errors.ts` | `AiProviderError` (codes: missing_api_key, missing_config, provider_error, invalid_response) |

### 5. Existing Error-related Code

| File | Content |
|------|---------|
| `src/lib/content/loading-messages.ts` | `AI_RETRY_ADVICE` constant defined but **never used anywhere** |
| `src/lib/voice/error-messages.ts` | `mapVoiceAnalysisError()` — good pattern for graceful messages |
| `src/lib/ai/chat-completions.ts` line 63-69 | Returns raw error body on non-ok response (up to 200 chars) |

### 6. Missing

- `/api/health` root endpoint
- AI provider status endpoint
- Graceful degradation messages for breakdown + remix (voice has it)
- Rate limiting on breakdown/remix/voice server actions
- Next.js middleware (none exists)
- Vercel config (`vercel.json` — none exists)
- Supabase backup/PITR verification (never checked)
- Monitoring docs

---

## Implementation Plan

### Phase 1: Extended Health Endpoint (Hermes + Cursor)

**File to create:** `src/app/api/health/route.ts`

```
GET /api/health
Returns:
{
  status: "ok" | "degraded" | "down",
  services: {
    app: "ok",
    supabase: "ok" | "error",
    ai: "ok" | "degraded" | "unreachable"
  },
  provider: "xiaomi:mimo-v2.5" | "gpt-4o-mini",
  checkedAt: "2026-...",
  uptime: "..." (optional)
}
```

**Implementation:**
- Reuse `runHealthCheckQuery()` from existing supabase health
- Add lightweight AI provider ping (simple health/status call, not a full inference)
  - For OpenAI-compatible: check `GET {baseUrl}/models` or just config presence
  - Keep safe: no API key in response
- Degraded = supabase ok but AI unreachable
- Down = supabase error

**Files:**
- CREATE `src/app/api/health/route.ts`
- CREATE `src/lib/ai/health-check.ts` (AI provider status check)
- MODIFY `src/lib/supabase/health-check.ts` (optional: add typed result)

### Phase 2: Graceful Degradation for AI Errors (Cursor)

**Pattern:** Copy `mapVoiceAnalysisError()` approach to breakdown + remix.

**File to create:** `src/lib/ai/error-messages.ts`

```typescript
// Shared error message mapper for all AI actions
export function mapAiProviderError(error: unknown, action: string): string {
  // timeout / 500 / rate limit → user-friendly Vietnamese
  // provider_error → actionable message with retry instruction
  // missing_api_key → config error (should not happen in prod)
}
```

**Files to modify:**
- CREATE `src/lib/ai/error-messages.ts`
- MODIFY `src/lib/content/analysis-actions.ts` — replace direct `error.message` with `mapAiProviderError(error, "phân tích")`
- MODIFY `src/lib/content/remix-actions.ts` — replace direct `error.message` with `mapAiProviderError(error, "remix")`
- MODIFY `src/lib/voice/actions.ts` — optionally migrate to shared mapper (keep existing if working)

**Graceful message examples:**
- AI timeout → "AI đang quá tải. Hãy thử lại sau 30 giây. Nếu tiếp tục lỗi, hãy thử giảm số biến thể hoặc dùng nội dung ngắn hơn."
- AI 5xx → "Máy chủ AI đang bảo trì. Hãy thử lại sau 1-2 phút."
- Rate limit → "Bạn đã gửi quá nhiều yêu cầu. Hãy đợi 1 phút rồi thử lại."

### Phase 3: Rate Limiting (Cursor)

**Approach:** Lightweight in-app rate limit using Supabase — no external service needed.

**File to create:** `src/lib/ai/rate-limit.ts`

```typescript
// Rate limit config
export const RATE_LIMITS = {
  breakdown: { maxRequests: 10, windowMinutes: 5 },
  remix:     { maxRequests: 5,  windowMinutes: 5 },
  voice:     { maxRequests: 3,  windowMinutes: 10 },
} as const;

export async function checkAiRateLimit(
  userId: string,
  action: "breakdown" | "remix" | "voice"
): Promise<{ allowed: boolean; retryAfterSec: number }>
```

**Implementation options (choose one):**

Option A: Supabase `ai_rate_limits` table (simple, auditable)
```sql
CREATE TABLE ai_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_rate_limits_user_action ON ai_rate_limits(user_id, action, requested_at);
-- Auto-cleanup older than 24h
```

Option B: In-memory (simpler, no migration, lost on restart — acceptable for beta)

**Recommendation:** Option A — clean, auditable, survives restart, useful for analytics cross-reference.

**Files to modify:**
- CREATE `src/lib/ai/rate-limit.ts`
- MODIFY `src/lib/content/analysis-actions.ts` — add `checkAiRateLimit(user.id, "breakdown")` before AI call
- MODIFY `src/lib/content/remix-actions.ts` — add `checkAiRateLimit(user.id, "remix")` before AI call
- MODIFY `src/lib/voice/actions.ts` — add `checkAiRateLimit(user.id, "voice")` before AI call

**Migration needed:** YES (1 table: `ai_rate_limits`)

### Phase 4: Monitoring Docs (Hermes)

**File to create:** `docs/vercel-supabase-monitoring.md`

Content:
- Vercel deployment monitoring (dashboard, logs, alerts)
- Supabase dashboard health checks (database, auth, storage)
- Supabase backup/PITR verification step-by-step
- How to check AI provider status manually
- Incident response checklist
- Key metrics to watch (error rate, AI latency, signup rate)

### Phase 5: Supabase Backup/PITR Verification (Hermes + manual)

**File to create:** `docs/supabase-backup-verification.md`

Content:
1. Log in to Supabase Dashboard → Project → Database → Backups
2. Check PITR status (enabled/disabled)
3. Check most recent backup timestamp
4. Verify backup size
5. Document result with date + screenshot path (not committed)

### Phase 6: Production Smoke Checklist Update (Hermes)

**File to modify:** `docs/production-smoke-test.md`

Add ALE-175 smoke section:
- Health endpoint check (GET /api/health → all 3 services ok)
- AI operation after rate limit (ensure graceful message, not crash)
- Rate limit enforcement (rapid-fire 2 requests → second gets "chờ X giây")
- No secrets in health response
- No raw error messages visible to user for AI failures

---

## Files Summary

| File | Action | Owner |
|------|--------|-------|
| `src/app/api/health/route.ts` | CREATE | Cursor |
| `src/lib/ai/health-check.ts` | CREATE | Cursor |
| `src/lib/ai/error-messages.ts` | CREATE | Cursor |
| `src/lib/ai/rate-limit.ts` | CREATE | Cursor |
| `src/lib/content/analysis-actions.ts` | MODIFY | Cursor |
| `src/lib/content/remix-actions.ts` | MODIFY | Cursor |
| `src/lib/voice/actions.ts` | MODIFY (optional) | Cursor |
| `docs/vercel-supabase-monitoring.md` | CREATE | Hermes |
| `docs/supabase-backup-verification.md` | CREATE | Hermes |
| `docs/production-smoke-test.md` | MODIFY | Hermes |
| `docs/project-status.md` | MODIFY | Hermes |

## Migration

| Migration | Table | Columns |
|-----------|-------|---------|
| `20260604_ai_rate_limits` | `ai_rate_limits` | id (uuid PK), user_id (uuid FK → auth.users), action (text), requested_at (timestamptz) |

Index: `(user_id, action, requested_at)` for fast `COUNT WHERE user_id=$1 AND action=$2 AND requested_at > now() - interval`

## Risk Areas

| Risk | Mitigation |
|------|-----------|
| Rate limit false-positive blocking real users | Generous limits (10 breakdown/5min, 5 remix/5min, 3 voice/10min) |
| AI health ping costs tokens or triggers errors | Use lightweight check (config validation, not full inference) |
| Migration on prod without review | Hard-stop before applying; review SQL first |
| Graceful messages hide real errors from debugging | Log original error server-side; show user-friendly message to user |

## Smoke Checklist (after implementation)

- [ ] `GET /api/health` returns 200 with app+supabase+ai statuses
- [ ] `GET /api/health/supabase` still works (regression)
- [ ] No API keys, tokens, or secrets in `/api/health` response
- [ ] AI operation fails gracefully with Vietnamese message (not raw error)
- [ ] Rate limit blocks rapid-fire requests with clear retry-after message
- [ ] Rate limit allows normal usage (no false positive)
- [ ] `npm run lint` PASS
- [ ] `npm run type-check` PASS
- [ ] `npm run build` PASS

## Should Cursor Implement?

**YES** — Phase 1-3 (health endpoint, graceful messages, rate limiting) are app code changes. Cursor handles well:
- Server action modifications (add rate limit guard, improve error messages)
- New API route creation (`/api/health`)
- New utility modules (`error-messages.ts`, `rate-limit.ts`, `health-check.ts`)

**Hermes handles:**
- Monitoring docs (`vercel-supabase-monitoring.md`)
- Backup verification doc
- Smoke checklist update
- Project status update
- Migration review
- Final production smoke

## Sequence

1. Hermes: create docs (monitoring + backup) — soft deliverable, no code
2. Cursor: implement Phase 1-3 (health + graceful + rate limit)
3. Hermes: review + migration review
4. Hermes: apply migration (user confirms)
5. Hermes: production smoke
6. Hermes: update project status

---

## Current State Before Implementation

- ✅ ALE-175 moved to In Progress
- ✅ Branch name: `anh555056/ale-175-m11-production-reliability-hardening`
- ✅ No existing health endpoint (only `/api/health/supabase`)
- ✅ No existing rate limiting
- ✅ Voice has graceful messages; breakdown + remix don't
- ✅ No middleware, no vercel.json
- ✅ `AI_RETRY_ADVICE` defined but unused
- ✅ Working tree clean (commit `01c609a`)
