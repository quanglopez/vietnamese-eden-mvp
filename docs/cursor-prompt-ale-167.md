1|# ALE-167 — Beta Analytics Events — Cursor Prompt
2|
3|## Context
4|
5|Vietnamese Eden MVP has **zero analytics**. No tracking deps, no event tables, no logging.
6|This prompt adds lightweight event tracking for the beta activation funnel.
7|
8|**Branch:** `feat/ale-167-beta-analytics`
9|**Base:** `main` (commit `6a56f96`)
10|**Scope:** Analytics only — no UI changes to existing pages except adding tracking calls.
11|
12|---
13|
14|## Current Architecture (relevant)
15|
16|| Layer | Details |
17||-------|---------|
18|| Auth | Supabase Auth — `signInWithPassword` in `src/components/custom/auth/login-form.tsx`, `signUp` in `signup-form.tsx` |
19|| Auth callback | `src/app/auth/callback/route.ts` — exchanges code, redirects to /dashboard |
20|| Server actions | `src/lib/boards/actions.ts` (createBoardAction), `src/lib/content/actions.ts` (addContentTextAction, addContentUrlAction), `src/lib/content/analysis-actions.ts` (runContentAnalysisAction), `src/lib/content/remix-actions.ts` (generateRemixAction), `src/lib/calendar/actions.ts` (addToCalendarAction) |
21|| Database | Supabase Postgres, 14 tables, RLS on all. `@supabase/ssr` client. |
22|| Existing types | `src/types/database.ts` — auto-generated Supabase types |
23|
24|---
25|
26|## Implementation Plan
27|
28|### Step 1: Migration — `analytics_events` table
29|
30|Create `supabase/migrations/20260603120000_analytics_events.sql`:
31|
32|```sql
33|-- Analytics events for beta activation funnel tracking
34|-- ALE-167: lightweight, no raw content logged
35|
36|create type public.analytics_event_type as enum (
37|  'signup',
38|  'login',
39|  'board_create',
40|  'content_add',
41|  'breakdown_run',
42|  'remix_run',
43|  'calendar_add'
44|);
45|
46|create table public.analytics_events (
47|  id uuid primary key default gen_random_uuid(),
48|  user_id uuid not null references auth.users(id) on delete cascade,
49|  event_type public.analytics_event_type not null,
50|  metadata jsonb default '{}',
51|  created_at timestamptz not null default now()
52|);
53|
54|-- Indexes for dashboard queries
55|create index idx_analytics_events_user on public.analytics_events(user_id);
56|create index idx_analytics_events_type on public.analytics_events(event_type);
57|create index idx_analytics_events_created on public.analytics_events(created_at desc);
58|
59|-- RLS: users can insert their own events, service role can read all
60|alter table public.analytics_events enable row level security;
61|
62|create policy "Users can insert own analytics events"
63|  on public.analytics_events for insert
64|  with check (auth.uid() = user_id);
65|
66|create policy "Users can read own analytics events"
67|  on public.analytics_events for select
68|  using (auth.uid() = user_id);
69|```
70|
71|**metadata jsonb** — lightweight context, never raw content:
72|- `signup`: `{ "method": "email" }`
73|- `login`: `{ "method": "email" }`
74|- `board_create`: `{ "board_id": "uuid" }`
75|- `content_add`: `{ "content_id": "uuid", "method": "text"|"url", "platform": "youtube"|... }`
76|- `breakdown_run`: `{ "content_id": "uuid", "model": "xiaomi:mimo-v2.5" }`
77|- `remix_run`: `{ "content_id": "uuid", "variant_count": 5, "format": "facebook_post", "tone": "gan_gui" }`
78|- `calendar_add`: `{ "calendar_item_id": "uuid", "channel": "facebook" }`
79|
80|**Privacy rules:**
81|- NEVER log raw content text, titles, or AI output
82|- NEVER log passwords, tokens, or API keys
83|- Only log IDs + enums + counts
84|
85|---
86|
87|### Step 2: Tracking helper — `src/lib/analytics/tracker.ts`
88|
89|Create a server-side tracking helper:
90|
91|```ts
92|"use server";
93|
94|import { createClient } from "@/lib/supabase/server";
95|import type { Database } from "@/types/database";
96|
97|type EventType = Database["public"]["Enums"]["analytics_event_type"];
98|
99|export async function trackEvent(
100|  eventType: EventType,
101|  metadata?: Record<string, string | number | boolean>
102|): Promise<void> {
103|  try {
104|    const supabase = createClient();
105|    const { data: { user } } = await supabase.auth.getUser();
106|    if (!user) return; // silently skip if not authenticated
107|
108|    await supabase.from("analytics_events").insert({
109|      user_id: user.id,
110|      event_type: eventType,
111|      metadata: metadata ?? {},
112|    });
113|  } catch {
114|    // Analytics must never break the main flow
115|    // Silently swallow errors
116|  }
117|}
118|```
119|
120|**Key design decisions:**
121|- Server action ("use server") — can be called from other server actions
122|- Fire-and-forget — never throws, never blocks
123|- Uses existing Supabase client pattern
124|- No additional dependencies
125|
126|---
127|
128|### Step 3: Emit events from existing code
129|
130|Add `trackEvent()` calls to these locations:
131|
132|| Event | File | Where |
133||-------|------|-------|
134|| `signup` | `src/components/custom/auth/signup-form.tsx` | After `supabase.auth.signUp()` succeeds (no error) |
135|| `login` | `src/components/custom/auth/login-form.tsx` | After `supabase.auth.signInWithPassword()` succeeds (no error) |
136|| `board_create` | `src/lib/boards/actions.ts` | In `createBoardAction()`, after board insert succeeds, before return |
137|| `content_add` | `src/lib/content/actions.ts` | In `addContentTextAction()` and `addContentUrlAction()`, after insert succeeds |
138|| `breakdown_run` | `src/lib/content/analysis-actions.ts` | In `runContentAnalysisAction()`, after analysis insert succeeds |
139|| `remix_run` | `src/lib/content/remix-actions.ts` | In `generateRemixAction()`, after outputs saved |
140|| `calendar_add` | `src/lib/calendar/actions.ts` | In `addToCalendarAction()`, after calendar item insert |
141|
142|**Pattern for each insertion:**
143|```ts
144|// After the success point, before return:
145|import { trackEvent } from "@/lib/analytics/tracker";
146|
147|// Fire-and-forget (don't await — don't block the response)
148|void trackEvent("board_create", { board_id: result.id });
149|```
150|
151|**Auth events (signup/login):**
152|The auth forms are client components that call Supabase auth directly.
153|After the auth call succeeds, add:
154|```ts
155|// In signup-form.tsx, after signUp succeeds:
156|void trackEvent("signup", { method: "email" });
157|
158|// In login-form.tsx, after signInWithPassword succeeds:
159|void trackEvent("login", { method: "email" });
160|```
161|
162|Note: `trackEvent` is a server action ("use server"), so it can be called from client components — Next.js will make an API call automatically.
163|
164|---
165|
166|### Step 4: Update Supabase types
167|
168|After migration is applied, regenerate types:
169|```bash
170|npx supabase gen types typescript --local > src/types/database.ts
171|```
172|
173|Or manually add the enum and table to `src/types/database.ts` if `supabase CLI` is not available.
174|
175|---
176|
177|### Step 5: Dashboard summary (optional, low priority)
178|
179|Create `src/app/(app)/dashboard/analytics/page.tsx` — admin-only view:
180|
181|```tsx
182|// Simple table showing event counts by type for last 7/30 days
183|// Query: SELECT event_type, count(*) FROM analytics_events WHERE created_at > now() - interval '7 days' GROUP BY event_type
184|// No charts, no complex UI — just a table
185|```
186|
187|**This is optional for MVP.** The core value is events being recorded. Dashboard can be a follow-up.
188|
189|---
190|
191|## File Changes Summary
192|
193|| File | Change |
194||------|--------|
195|| `supabase/migrations/20260603120000_analytics_events.sql` | NEW — migration |
196|| `src/lib/analytics/tracker.ts` | NEW — tracking helper |
197|| `src/components/custom/auth/signup-form.tsx` | ADD trackEvent call |
198|| `src/components/custom/auth/login-form.tsx` | ADD trackEvent call |
199|| `src/lib/boards/actions.ts` | ADD trackEvent call |
200|| `src/lib/content/actions.ts` | ADD trackEvent call (2 places) |
201|| `src/lib/content/analysis-actions.ts` | ADD trackEvent call |
202|| `src/lib/content/remix-actions.ts` | ADD trackEvent call |
203|| `src/lib/calendar/actions.ts` | ADD trackEvent call |
204|| `src/types/database.ts` | UPDATE — add analytics_events table + enum |
205|| `src/app/(app)/dashboard/analytics/page.tsx` | OPTIONAL — admin summary |
206|
207|**Total:** 1 migration + 1 new file + 7 modified files (+1 optional page)
208|
209|---
210|
211|## Acceptance Criteria
212|
213|- [ ] Migration creates `analytics_events` table with RLS
214|- [ ] `trackEvent()` helper exists at `src/lib/analytics/tracker.ts`
215|- [ ] `trackEvent` never throws — silent failure on errors
216|- [ ] `signup` event fires on successful email signup
217|- [ ] `login` event fires on successful email login
218|- [ ] `board_create` event fires on board creation
219|- [ ] `content_add` event fires on text and URL content add
220|- [ ] `breakdown_run` event fires on AI breakdown
221|- [ ] `remix_run` event fires on remix generation
222|- [ ] `calendar_add` event fires on calendar item creation
223|- [ ] No raw content text/titles/AI output in metadata
224|- [ ] No passwords/tokens/API keys in metadata
225|- [ ] `npm run lint` passes
226|- [ ] `npm run type-check` passes
227|- [ ] `npm run build` passes
228|- [ ] Events appear in Supabase `analytics_events` table after manual smoke
229|
230|---
231|
232|## Smoke / Test Checklist
233|
234|```bash
235|# 1. Apply migration
236|npx supabase db push
237|# Or: paste SQL in Supabase Dashboard SQL Editor
238|
239|# 2. Verify table exists
240|curl -H "apikey: $SUPABASE_ANON_KEY" \
241|  "https://<ref>.supabase.co/rest/v1/analytics_events?limit=0"
242|# Expected: 200, []
243|
244|# 3. Run type-check + build
245|npm run type-check && npm run build
246|
247|# 4. Manual smoke on production (after deploy)
248|# - Login → check analytics_events table for 'login' event
249|# - Create board → check for 'board_create' event
250|# - Add content → check for 'content_add' event
251|# - Run breakdown → check for 'breakdown_run' event
252|# - Generate remix → check for 'remix_run' event
253|# - Add to calendar → check for 'calendar_add' event
254|# - Signup with new email → check for 'signup' event
255|
256|# 5. Privacy check
257|# - Query: SELECT metadata FROM analytics_events
258|# - Verify: no raw text, no passwords, no API keys
259|```
260|
261|---
262|
263|## Rollback Plan
264|
265|If analytics causes issues:
266|
267|1. **Disable tracking** — Comment out `trackEvent` import in each file (7 files)
268|   - Or: make `trackEvent` return early with `if (true) return;`
269|2. **Drop table** — `DROP TABLE IF EXISTS public.analytics_events; DROP TYPE IF EXISTS public.analytics_event_type;`
270|3. **No rollback needed for** — the tracking helper is fire-and-forget, so even if the table is missing, the try/catch silently swallows errors
271|
272|**Risk level:** LOW — analytics is fire-and-forget, never blocks main flow.
273|
274|---
275|
276|## Implementation Notes
277|
278|- **Do NOT add npm dependencies** — use existing `@supabase/ssr` client only
279|- **Do NOT modify existing UI** — only add `trackEvent()` calls, no visual changes
280|- **Do NOT await trackEvent** — use `void trackEvent(...)` to fire-and-forget
281|- **Do NOT log raw content** — only IDs, enums, counts
282|- The `trackEvent` server action can be called from client components — Next.js handles the API bridge
283|- If Supabase CLI is not available for type generation, manually add the enum + table types to `database.ts`
284|- The optional dashboard page can be deferred to a follow-up issue if scope is unclear
285|