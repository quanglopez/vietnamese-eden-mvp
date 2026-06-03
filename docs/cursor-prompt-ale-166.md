1|# ALE-166 — Production Smoke Suite Cleanup — Cursor Prompt
2|
3|## Context
4|
5|Vietnamese Eden MVP has a Browser Use/Playwright smoke test suite at `scripts/browser-use/`.
6|ALE-160 created the initial runner + 7 tasks. M9 added more scripts (ALE-163, ALE-165)
7|but they were written as standalone one-off files instead of tasks in the runner.
8|
9|Working tree currently has 6 uncommitted Browser Use files (2 modified, 4 untracked).
10|This prompt consolidates everything into a coherent suite.
11|
12|**Branch:** `feat/ale-166-smoke-suite-cleanup`
13|**Base:** `main` (commit `19f03ac`)
14|**No app code changes.** Only `scripts/browser-use/` + `.gitignore` + `docs/`.
15|
16|---
17|
18|## File Disposition
19|
20|| File | Action | Reason |
21||------|--------|--------|
22|| `scripts/browser-use/index.ts` | **KEEP modified** (already staged) | Adds `tags` to task registry |
23|| `scripts/browser-use/tasks/auth.ts` | **KEEP modified** (already staged) | Fixes brittle data-testid → CSS selectors |
24|| `scripts/browser-use/tasks/tags.ts` | **MOVE into tasks/** (already there) | Proper task, registered in index.ts |
25|| `scripts/browser-use/ale163-saved-views-smoke.ts` | **REFACTOR → `tasks/saved-views.ts`** | Convert standalone script to runner task |
26|| `scripts/browser-use/ale165-smoke.ts` | **REFACTOR → `tasks/content-detail.ts`** | Convert standalone script to runner task |
27|| `scripts/browser-use/diag-ale165.ts` | **DELETE** | One-off diagnostic, no longer needed |
28|| `scripts/browser-use/screenshots/` | **ADD to .gitignore** | Screenshots dir currently not gitignored |
29|
30|---
31|
32|## Task 1: Fix auth selectors (tasks/auth.ts)
33|
34|The working tree already has the fix (input[type=email] instead of data-testid).
35|**Verify** the committed version uses `data-testid` and the local version uses CSS selectors.
36|Accept the local version as-is.
37|
38|**Current (committed, broken):**
39|```ts
40|await page.fill('[data-testid="login-email"]', c.testEmail);
41|await page.fill('[data-testid="login-password"]', c.testPassword);
42|await page.click('[data-testid="login-submit"]');
43|await page.waitForURL(/\/(dashboard|dashboards)/, { timeout: 15_000 });
44|```
45|
46|**Target (local, fixed):**
47|```ts
48|await page.fill('input[type="email"]', c.testEmail);
49|await page.fill('input[type="password"]', c.testPassword);
50|await page.click('button:has-text("Đăng nhập")');
51|await page.waitForURL(/\/(dashboard|boards)/, { timeout: 15_000 });
52|```
53|
54|Also apply the same selector pattern to `tasks/tags.ts` — it uses `[data-testid="tag-manager-dialog"]`, `[data-testid="tag-input"]`, `[data-testid="create-tag-button"]`, `[data-testid="manage-tags-button"]`, `[data-testid="content-item-card"]`, `[data-testid="add-content-button"]`. These may not exist in the production DOM.
55|
56|**For tags.ts, replace brittle selectors with:**
57|- `[data-testid="tag-manager-dialog"]` → `role=dialog` or text-based locator
58|- `[data-testid="tag-input"]` → `input[placeholder*="tag" i]` or `input[placeholder*="thẻ" i]`
59|- `[data-testid="create-tag-button"]` → button with text "Tạo" or "Thêm tag"
60|- `[data-testid="manage-tags-button"]` → `text=Quản lý tag`
61|- `[data-testid="content-item-card"]` → `.rounded-lg.border` or generic card selector
62|- `[data-testid="add-content-button"]` → `button:has-text("Thêm")` or `button:has-text("Add")`
63|
64|---
65|
66|## Task 2: Convert ale163-saved-views-smoke.ts → tasks/saved-views.ts
67|
68|The standalone script (417 lines) does login + board navigate + saved view CRUD + regression.
69|Convert it to the runner task interface:
70|
71|```ts
72|import type { SmokeContext, SmokeResult, SmokeStep } from "../types";
73|
74|export default async function runSavedViews(context: SmokeContext): Promise<SmokeResult> {
75|  // ... use context.page, context.config, context.log
76|  // Same logic, restructured as steps array
77|}
78|```
79|
80|**Steps to extract from the standalone script:**
81|1. Login (reuse auth pattern)
82|2. Navigate to board with content
83|3. Open saved views dropdown (baseline)
84|4. Set platform filter = TikTok
85|5. Type search query
86|6. Save view with unique name
87|7. Verify view appears in dropdown
88|8. Reset filters, apply saved view (restore)
89|9. Duplicate name guard
90|10. Delete saved view
91|11. Regression: Add content modal
92|12. Regression: Breakdown link
93|13. Regression: Tag manager UI
94|14. Regression: filters still functional
95|
96|**Key changes from standalone:**
97|- Remove `dotenv` import — config comes from `context.config`
98|- Remove `chromium.launch` — browser managed by runner
99|- Replace `step()` + `snap()` with runner's step pattern
100|- Use `context.config.baseUrl` instead of env var
101|- Keep `forceClick` and `clearTopBanner` helpers (they're needed for this page)
102|- Screenshot on FAIL is handled by runner, so remove `snap()` calls (or keep optional ones as `context.log`)
103|
104|---
105|
106|## Task 3: Convert ale165-smoke.ts → tasks/content-detail.ts
107|
108|The standalone script (218 lines) tests the content detail / breakdown page.
109|Convert to runner task interface:
110|
111|**Steps to extract:**
112|1. Login
113|2. Dashboard renders
114|3. Find and navigate to board
115|4. Find content items on board
116|5. Navigate to breakdown page
117|6. Source/content section
118|7. SourceQuality badge
119|8. AI Breakdown section
120|9. Tags section (SKIP if not found)
121|10. Remix section
122|11. Remix empty/filled state
123|12. Calendar section
124|13. Calendar empty/filled state
125|14. Add to Calendar CTA
126|15. Back/board navigation
127|16. Add content regression
128|
129|**Key changes:**
130|- Same refactor as saved-views: remove dotenv, chromium.launch, standalone helpers
131|- Use `context.config.baseUrl`
132|- Use `context.log` instead of `console.log`
133|- Steps pattern matches existing tasks (auth.ts, board.ts)
134|
135|---
136|
137|## Task 4: Update index.ts task registry
138|
139|After refactoring, the TASKS map should be:
140|
141|```ts
142|const TASKS: Record<string, () => Promise<{ default: SmokeTaskFn }>> = {
143|  auth: () => import("./tasks/auth"),
144|  board: () => import("./tasks/board"),
145|  "ai-breakdown": () => import("./tasks/ai-breakdown"),
146|  remix: () => import("./tasks/remix"),
147|  "voice-profile": () => import("./tasks/voice-profile"),
148|  calendar: () => import("./tasks/calendar"),
149|  "m8-source-quality": () => import("./tasks/m8-source-quality"),
150|  tags: () => import("./tasks/tags"),
151|  "saved-views": () => import("./tasks/saved-views"),
152|  "content-detail": () => import("./tasks/content-detail"),
153|};
154|```
155|
156|---
157|
158|## Task 5: .gitignore additions
159|
160|Add to `.gitignore`:
161|```
162|# Browser Use screenshots (generated, never commit)
163|scripts/browser-use/screenshots/
164|```
165|
166|---
167|
168|## Task 6: Fix .env.browser-use.example
169|
170|Current file has a broken line (password line merges with comment):
171|```
172|BROWSER_USE_TEST_PASSWORD=*** Screenshot output directory (optional, defaults to ./screenshots)
173|```
174|
175|Fix to:
176|```
177|BROWSER_USE_TEST_PASSWORD=
178|
179|# Screenshot output directory (optional, defaults to ./scripts/browser-use/screenshots)
180|# BROWSER_USE_SCREENSHOT_DIR=./scripts/browser-use/screenshots
181|```
182|
183|---
184|
185|## Task 7: Create README.md
186|
187|Create `scripts/browser-use/README.md`:
188|
189|```markdown
190|# Browser Use QA Smoke Suite
191|
192|Playwright-based production smoke tests for Vietnamese Eden MVP.
193|
194|## Setup
195|
196|1. Copy `.env.browser-use.example` to `.env.browser-use`
197|2. Fill in `BROWSER_USE_TEST_EMAIL` and `BROWSER_USE_TEST_PASSWORD`
198|3. Install deps: `npx playwright install chromium`
199|
200|## Run
201|
202|```bash
203|# Run all tasks
204|npx tsx scripts/browser-use/index.ts
205|
206|# Run specific tasks
207|npx tsx scripts/browser-use/index.ts auth board tags
208|
209|# Non-headless (watch browser)
210|BROWSER_USE_HEADLESS=false npx tsx scripts/browser-use/index.ts auth
211|```
212|
213|## Tasks
214|
215|| Task | Description |
216||------|-------------|
217|| auth | Login + session cookie verify |
218|| board | Board list + content card |
219|| ai-breakdown | AI breakdown page sections |
220|| remix | Remix form + output |
221|| voice-profile | Voice profile setup |
222|| calendar | Calendar section |
223|| m8-source-quality | M8 source quality badges |
224|| tags | ALE-162 tag manager CRUD |
225|| saved-views | ALE-163 saved board views CRUD |
226|| content-detail | ALE-165 content detail page |
227|
228|## Environment
229|
230|- Target: `https://vietnamese-eden-mvp.vercel.app` (production)
231|- Allowed domains enforced in `config.ts`
232|- Credentials: `.env.browser-use` (gitignored, never commit)
233|- Screenshots: `screenshots/` (gitignored)
234|
235|## Adding a new task
236|
237|1. Create `tasks/your-task.ts` with default export `SmokeTaskFn`
238|2. Add entry to `TASKS` map in `index.ts`
239|3. Run: `npx tsx scripts/browser-use/index.ts your-task`
240|```
241|
242|---
243|
244|## Task 8: Delete diag-ale165.ts
245|
246|Remove `scripts/browser-use/diag-ale165.ts` — one-off diagnostic, no longer needed.
247|
248|---
249|
250|## Acceptance Criteria
251|
252|- [ ] `tasks/auth.ts` uses CSS selectors (no data-testid)
253|- [ ] `tasks/tags.ts` uses robust selectors (no data-testid)
254|- [ ] `tasks/saved-views.ts` exists and follows runner interface
255|- [ ] `tasks/content-detail.ts` exists and follows runner interface
256|- [ ] `index.ts` TASKS map has 10 entries (auth, board, ai-breakdown, remix, voice-profile, calendar, m8-source-quality, tags, saved-views, content-detail)
257|- [ ] `diag-ale165.ts` deleted
258|- [ ] `ale163-saved-views-smoke.ts` deleted (replaced by tasks/saved-views.ts)
259|- [ ] `ale165-smoke.ts` deleted (replaced by tasks/content-detail.ts)
260|- [ ] `.gitignore` includes `scripts/browser-use/screenshots/`
261|- [ ] `.env.browser-use.example` has correct format (no merged lines)
262|- [ ] `scripts/browser-use/README.md` exists with run instructions
263|- [ ] No credentials, screenshots, or .env files in commit
264|- [ ] `npm run lint` passes (if touched files are in tsconfig)
265|- [ ] `npm run type-check` passes
266|- [ ] `npm run build` passes
267|- [ ] Smoke suite can run: `npx tsx scripts/browser-use/index.ts auth` against production
268|
269|---
270|
271|## Smoke / Test Checklist
272|
273|After implementation, run locally:
274|
275|```bash
276|# 1. Verify TypeScript compiles
277|cd vietnamese-eden-mvp
278|npx tsc --noEmit scripts/browser-use/index.ts scripts/browser-use/tasks/*.ts
279|
280|# 2. Run auth task only (quick verify)
281|npx tsx scripts/browser-use/index.ts auth
282|
283|# 3. Run full suite (takes ~5 min)
284|npx tsx scripts/browser-use/index.ts
285|
286|# 4. Verify no secrets in staged files
287|git diff --cached --name-only | xargs grep -l "password\|secret\|key" || echo "clean"
288|```
289|
290|---
291|
292|## Implementation Notes
293|
294|- **Do NOT modify any app code** (`src/`, `app/`, `components/`).
295|- **Do NOT touch `.env` files** (only `.env.browser-use.example`).
296|- **Do NOT commit screenshots** or generated files.
297|- The `tags.ts` task uses `[data-testid]` selectors that may not exist in production DOM. The implementer should test against production and fall back to text/CSS selectors if needed.
298|- The `saved-views.ts` task has complex helpers (`forceClick`, `clearTopBanner`, `dismissBanner`). These are necessary because the board detail page has a persistent warning banner that intercepts pointer events. Keep them.
299|- The `content-detail.ts` task uses `page.content()` + regex matching. This is acceptable for smoke tests (not e2e tests).
300|