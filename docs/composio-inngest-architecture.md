# Composio + Inngest automation architecture — Vietnamese Eden MVP

**Status:** DRAFT — Architecture spike (ALE-191)  
**Date:** 2026-06-06  
**Audience:** Owner + engineering team  
**Scope:** Docs-only. No code. No install. No env vars. No OAuth implementation. No tool execution. No automation.

---

## Table of Contents

1. [Summary & recommendation](#1-summary--recommendation)
2. [Can Composio and Inngest coexist?](#2-can-composio-and-inngest-coexist)
3. [Responsibility split](#3-responsibility-split)
4. [Feature analysis](#4-feature-analysis)
5. [Safe pilot definition](#5-safe-pilot-definition)
6. [Anti-goals](#6-anti-goals)
7. [Data flows](#7-data-flows)
8. [Auth strategy](#8-auth-strategy)
9. [Proposed Linear issues](#9-proposed-linear-issues)
10. [Risk table & go/no-go gates](#10-risk-table--gono-go-gates)
11. [Decision memo](#11-decision-memo)

---

## 1. Summary & recommendation

**Verdict:** Composio is architecturally compatible with the existing Next.js + Supabase + Inngest stack. However, **no Composio integration should occur before M16 (post-public-beta + post-paywall)**. The safe pilot (Notion + Google Sheets export, user-initiated only) is the lowest-risk path and should be the first integration attempted.

**Current stack readiness:**
- Inngest is already wired (`src/inngest/`, endpoint at `/api/inngest/route.ts`)
- Supabase auth is mature (RLS on all tables, session middleware, per-user workspace isolation)
- No external integrations or webhook handlers exist — this is a greenfield for Composio

**Risk level:** HIGH at MVP stage. Composio introduces a new SaaS dependency, new OAuth flows, new error surfaces, new per-user state management. Ship the core product first.

---

## 2. Can Composio and Inngest coexist?

**Yes, with clear boundaries.**

| Concern | Resolution |
|---|---|
| Two async runtimes? | No conflict. Inngest is a durable job queue that runs inside Next.js App Router as an API route handler. Composio is an external tool-execution proxy — it is called *by your code*, not hosted. |
| Overlapping concerns? | Composio = **tool execution** (call Slack API, write to Google Sheets). Inngest = **orchestration** (when to call, retry logic, fan-out, scheduling). They are complementary, not competing. |
| Auth collision? | Supabase owns user identity & sessions. Composio owns per-user OAuth tokens to third-party services (Facebook, Notion, etc.). A Supabase `user.id` maps to a Composio `connected_account_id`. These never conflict. |
| Cold-start latency? | An Inngest step that calls Composio adds ~200ms–2s depending on the external service. Acceptable for async workflows; unacceptable for synchronous API routes. Always invoke via Inngest, never inline. |

**Architecture pattern:**

```
Next.js App Router
├── src/app/api/inngest/route.ts ← Inngest hosted here (internal)
├── src/lib/composio/             ← Composio SDK client wrapper (future, NOT NOW)
└── src/lib/integrations/         ← Per-feature workflow triggers
```

---

## 3. Responsibility split

| Concern | Owner | Why |
|---|---|---|
| **User identity + session** | Supabase Auth | Already the SSOT for user_id, workspace, org |
| **Job queue + scheduling + retry** | Inngest | Already wired. Handles fan-out, concurrency, backoff |
| **External API tool execution** | Composio | Abstracts OAuth + API complexity for 1000+ apps |
| **Per-user OAuth tokens** | Composio | Composio manages refresh, revocation, scoping |
| **Connected account references** | Supabase | Simple `connected_accounts` table: user_id, composio_entity_id, provider, status |
| **Feature gating + opt-in** | Supabase + Eden app code | Feature flags per workspace; opt-in per user |
| **Webhook receipt from external services** | Next.js API route → Supabase | Eden owns the webhook endpoint, validates, stores event, triggers Inngest if needed |

---

## 4. Feature analysis

### 4.1 Auto-publish Facebook/TikTok/LinkedIn

| Criterion | Assessment |
|---|---|
| **Risk** | 🔴 CRITICAL |
| **MVP readiness** | Not ready — requires OAuth, content format mapping, platform API stability |
| **Recommended milestone** | M17 or later |
| **Composio role** | Executes platform API calls (create post, upload media, check status) |
| **Inngest role** | Orchestrates: user schedules → Inngest triggers at time → calls Composio → logs result |
| **Required user consent** | Explicit per-platform OAuth grant + per-post approval toggle |
| **Required data model** | `publishing_connections` (user_id, platform, composio_entity_id, status), `publishing_logs` (post_id, platform, status, response) |
| **Required env vars** | `COMPOSIO_API_KEY` (production only), `INNGEST_EVENT_KEY` |
| **Launch blocker?** | ❌ Post-launch. Auto-publish is a premium/power-user feature. |

### 4.2 Auto-research viral Vietnamese content

| Criterion | Assessment |
|---|---|
| **Risk** | 🔴 HIGH |
| **MVP readiness** | Not ready — requires scraping, platform ToS compliance, content attribution, legal review |
| **Recommended milestone** | M18+ |
| **Composio role** | Minimal. Composio is not a scraper — it's an API proxy. Research would use direct platform APIs (YouTube Data API v3, TikTok Research API) or require Skyvern-style browser agents (out of scope). |
| **Inngest role** | Scheduled scanning + deduplication + ingestion pipeline |
| **Required user consent** | Allowlist of sources only. No scraping without explicit source approval from content creator. |
| **Required data model** | `research_sources` (source_url, platform, allowlist_status, last_scanned), `viral_candidates` (content fingerprint, engagement metrics, source) |
| **Required env vars** | Platform-specific API keys (YouTube, TikTok) — NOT via Composio |
| **Launch blocker?** | ❌ Post-launch. Research is a different product surface. |

### 4.3 Notion + Google Sheets sync

| Criterion | Assessment |
|---|---|
| **Risk** | 🟡 MEDIUM |
| **MVP readiness** | Best candidate for pilot |
| **Recommended milestone** | **M15** (first post-MVP integration) |
| **Composio role** | `NOTION_APPEND_BLOCK_CHILDREN`, `NOTION_CREATE_PAGE`, `GOOGLE_SHEETS_APPEND_VALUES` — all available as pre-built tools |
| **Inngest role** | User clicks "Xuất ra Notion" → Inngest function fires → calls Composio → writes to Notion/Sheets → returns success/failure |
| **Required user consent** | Explicit per-connection OAuth (Notion OAuth, Google OAuth) |
| **Required data model** | `connected_accounts` (see §8), `export_logs` (user_id, provider, content_id, status, timestamp) |
| **Required env vars** | `COMPOSIO_API_KEY`, `INNGEST_EVENT_KEY` |
| **Launch blocker?** | ❌ Not a launch blocker. Post-MVP feature. |

### 4.4 Slack/Telegram notification

| Criterion | Assessment |
|---|---|
| **Risk** | 🟡 MEDIUM |
| **MVP readiness** | Requires opt-in skeleton — low code, high UX sensitivity |
| **Recommended milestone** | **M16** |
| **Composio role** | `SLACK_SEND_MESSAGE`, `TELEGRAM_SEND_MESSAGE` — simple message delivery |
| **Inngest role** | Event-driven: breakdown_completed → notify user → batch/throttle to avoid spam |
| **Required user consent** | Per-channel opt-in + per-notification-type toggle (breakdown_complete, publish_scheduled, weekly_summary) |
| **Required data model** | `notification_preferences` (user_id, channel: slack|telegram, event_type, enabled), `notification_logs` (user_id, channel, event_type, status, sent_at) |
| **Required env vars** | None additional — notification channels configured per-user via Composio OAuth |
| **Launch blocker?** | ❌ Not a launch blocker. Post-MVP. |

---

## 5. Safe pilot definition

### Recommended pilot: Notion + Google Sheets export (user-initiated only)

**Trigger:** User clicks "Xuất ra Notion" or "Xuất ra Google Sheets" from content detail or board view.

**Flow:**
1. User connects Notion/Google via OAuth in `/settings/integrations`
2. Supabase writes `connected_accounts` row (provider=notion, status=active)
3. On export click: Eden calls Inngest event `integrations/export`
4. Inngest function:
   a. `step.run("validate-connection")` — check connected_accounts row
   b. `step.run("fetch-content")` — grab content from `content_items` table
   c. `step.run("composio-export")` — call Composio with user's connected_account_id + content payload
   d. `step.run("log-result")` — write `export_logs` row
5. Inngest returns success/failure → Eden shows toast

**Guardrails for pilot:**
- No auto-sync. Every export is user-initiated.
- Rate limit: 10 exports/user/hour via `ai_rate_limits` pattern (existing table)
- Stale connection detection: if Composio returns auth error, set `connected_accounts.status = 'expired'`, prompt user to re-connect
- Composio SDK not installed until pilot milestone (M15)

---

## 6. Anti-goals

These are **things we deliberately will NOT do** and commit to not doing:

| # | Anti-goal | Rationale |
|---|---|---|
| 1 | **No auto-publish without human approval** | Prevents accidental posting. Every publish action requires user confirmation at schedule time. |
| 2 | **No scraping without allowlist** | Prevents legal exposure. Only sources explicitly approved by owner or user are fetched. |
| 3 | **No Telegram/Slack spam** | Prevent notification fatigue. Max 1 notification/user/event_type/hour. Opt-out always available. |
| 4 | **No secrets committed to repo** | `COMPOSIO_API_KEY`, OAuth client secrets, and platform tokens live in Vercel env vars only. `.env.example` contains placeholder values only. |
| 5 | **No external API automation until auth + opt-in exist** | Before any API call, the user must have (a) connected the account via OAuth, and (b) opted into the feature. No silent automations. |
| 6 | **No background sync without user knowledge** | User must see which integrations are active in `/settings/integrations`. Active connections are visible, disconnectable, and auditable. |
| 7 | **No Composio SDK install before M15** | Keep `package.json` clean until safe pilot is greenlit and owner explicitly says "integrate now." |

---

## 7. Data flows

### 7.1 Export flow (Notion/Sheets — primary pilot)

```
┌──────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐    ┌──────────────┐
│  User    │    │  Eden App   │    │  Inngest │    │ Composio │    │ Notion/Google│
│  clicks  │───>│ POST /api/  │───>│ function │───>│ tool     │───>│ API          │
│ "Xuất"   │    │ inngest     │    │ "export" │    │ execution│    │              │
└──────────┘    └─────────────┘    └──────────┘    └──────────┘    └──────────────┘
                       │                 │                │                │
                       │             Supabase             │                │
                       │         (connected_accounts,     │                │
                       │          export_logs)            │                │
                       └─────────────────┴────────────────┘                │
                                                                           │
                                              Response: success/failure ────┘
```

### 7.2 Webhook/callback flow (future — notifications, publish status)

```
┌──────────────────┐    ┌─────────────┐    ┌──────────┐
│ External service │    │ Eden Webhook│    │ Supabase │
│ (Slack/TikTok)   │───>│ POST handler│───>│ (event   │
│ callback         │    │ /api/webhooks│   │  log)    │
└──────────────────┘    └─────────────┘    └──────────┘
                              │
                              │ (if subscribe needed)
                              ▼
                         ┌──────────┐
                         │  Inngest │
                         │ function │
                         └──────────┘
```

### 7.3 Publishing flow (future — NOT in pilot)

```
┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────┐
│ User     │    │ Eden App    │    │ Inngest      │    │ Composio │
│ schedules│───>│ writes      │───>│ scheduled fn │───>│ publish  │
│ post     │    │ calendar    │    │ at publish   │    │ tool     │
└──────────┘    └─────────────┘    │ time         │    └──────────┘
                                       │                      │
                                   ┌───────┐          ┌──────────────┐
                                   │Supabase│         │ Platform API │
                                   │publish │         │(Facebook/    │
                                   │logs   │         │TikTok/LinkedIn)│
                                   └───────┘          └──────────────┘
```

---

## 8. Auth strategy

### Principle: Supabase owns identity. Composio owns OAuth tokens.

```
┌─────────────────────────────────────────────┐
│                 Supabase                    │
│  users (id, email)                          │
│  └─ connected_accounts                     │
│     ├─ id (uuid, PK)                       │
│     ├─ user_id (FK → users.id)             │
│     ├─ provider (notion|google_sheets|     │
│     │   slack|telegram|facebook|tiktok|     │
│     │   linkedin)                           │
│     ├─ composio_entity_id (text)           │
│     ├─ status (active|expired|revoked)     │
│     ├─ scopes (text[])                     │
│     ├─ connected_at (timestamptz)          │
│     └─ last_used_at (timestamptz)          │
│                                            │
│  ┌─ STRICT RULE:                           │
│  │  No OAuth access tokens or refresh      │
│  │  tokens stored in Supabase. EVER.       │
│  │  Composio manages all token lifecycle.  │
│  └─────────────────────────────────────────│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│                 Composio                    │
│  ┌─ Connected Account (per user)           │
│  │  ├─ composio_entity_id                  │
│  │  ├─ provider                            │
│  │  ├─ OAuth access_token (encrypted)      │
│  │  ├─ OAuth refresh_token (encrypted)     │
│  │  └─ token expiry                        │
│  └─────────────────────────────────────────│
└─────────────────────────────────────────────┘
```

### OAuth connection flow

1. User visits `/settings/integrations`
2. User clicks "Kết nối Notion"
3. Eden redirects to Composio OAuth initiate URL
4. User authorizes Notion
5. Composio callback → Eden stores `connected_accounts` row (provider=notion, composio_entity_id=..., status=active)
6. Future calls: Eden passes `composio_entity_id` to Composio SDK → Composio uses stored token

**Where it lives:** `/settings/integrations` (under `/dashboard/settings/integrations`)

---

## 9. Proposed Linear issues

These issues should NOT be created until M15 planning is confirmed by owner. Listed here for reference only.

| Issue | Title | Type | Scope |
|---|---|---|---|
| **ALE-192** | Composio SDK setup + integration registry | Setup | Install `composio` npm package, create `src/lib/composio/client.ts`, define `connected_accounts` table migration, build `/settings/integrations` page skeleton |
| **ALE-193** | Notion + Google Sheets export pilot | Feature | Implement Inngest "export" function, connect Notion/Sheets OAuth, "Xuất ra Notion" UI, export_logs tracking, rate limiting |
| **ALE-194** | Notification opt-in skeleton | Feature | `notification_preferences` table, per-channel opt-in UI, Inngest notification function skeleton (send placeholder, no actual delivery) |
| **ALE-195** | Auto-publish draft-only pilot | Feature | `publishing_connections` table, platform OAuth (Facebook only), draft posting (not live), approval gate |
| **ALE-196** | Research source allowlist + import candidates | Investigation | Evaluate platform APIs feasibility, draft `research_sources` schema, legal/ToS check, produce GO/NO-GO recommendation doc |

---

## 10. Risk table & go/no-go gates

### Risk register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Composio SDK breaking changes during MVP | Medium | Medium | Pin version. Do not install until M15. |
| R2 | OAuth token refresh failure → silent export failures | Medium | High | Inngest step for auth validation before every call. Set connection status to `expired` on failure. |
| R3 | Composio downtime → all integrations fail | Low | High | Graceful degradation: show "Tạm thời không khả dụng" toast. No crash. |
| R4 | User connects account, then revokes from platform directly | Medium | Medium | Composio's webhook should handle this. Fallback: status check before each call. |
| R5 | Scope creep — owner wants all 4 features at once | High | High | Hard gate: one feature per milestone. Pilot = Notion/Sheets only. |
| R6 | Composio pricing changes during beta | Low | Medium | Free tier should cover pilot usage (< 1,000 calls/month). Monitor via Composio dashboard. |
| R7 | Inngest step timeout (Composio call > 10 min) | Low | Medium | Inngest default step timeout is 10 min. Most Composio calls complete in < 5s. Set explicit timeout per step. |

### Go/No-Go gates

| Gate | Condition | When |
|---|---|---|
| **G1: Start M15** | MVP core features shipped (Swipe Board, AI Breakdown, Voice Profile, Remix, Calendar), public beta has 10+ active users, no P0 bugs open | M14 closeout → M15 planning |
| **G2: Install Composio SDK** | Owner explicitly confirms "Install Composio now", `connected_accounts` migration applied to production, `COMPOSIO_API_KEY` set in Vercel | Start of ALE-192 |
| **G3: Ship first export** | Notion + Sheets export works end-to-end (OAuth → export → verify in external app), < 10s latency, zero auth errors in 24h | ALE-193 Done |
| **G4: Add second integration** | First integration stable for 7 days, no unresolved auth issues, user feedback positive on `/settings/integrations` UX | M16 planning |
| **G5: Auto-publish** | Legal review of platform ToS complete, explicit user approval per post, publishing_logs auditable, rollback tested | M17 planning (earliest) |

---

## 11. Decision memo

### Verdict: **WAIT** — Do not integrate Composio now.

| Criterion | Score | Notes |
|---|---|---|
| **Architectural fit** | ✅ YES | Composio + Inngest coexist cleanly. Responsibility split is clear. |
| **Codebase readiness** | ✅ YES | Inngest is wired. Supabase auth is mature. Only missing piece is Composio SDK + `connected_accounts` table. |
| **MVP priority** | ❌ NO | Zero MVP features depend on external integrations. All core features operate on Eden's own data. |
| **Risk appetite** | ❌ NO | At MVP stage with Cohort 2 just invited, a new SaaS dependency adds friction without revenue gain. |
| **User demand** | ⬜ UNKNOWN | No beta tester has requested Notion/Sheets export or auto-publish. Wait for Cohort 2 feedback. |
| **Engineering bandwidth** | ❌ NO | M14 is already planned (Cohort 2 data collection + decision). M15 would be the earliest integration window. |

**What changes the verdict:**
- A beta tester explicitly requests Notion/Sheets export → reprioritize ALE-193 to M15
- M14 closeout + public beta shows 20+ active users → integration value increases
- Owner decides Notion export is a core differentiator for Vietnamese creators → fast-track to M15

**Stay disciplined.** Ship the core product. Integrations are amplifier features — they only help if users are already getting value from Eden's core workflow.

---

*Architecture spike complete. Recommended next step: no action until M14 closeout. Revisit this doc at M15 planning.*
