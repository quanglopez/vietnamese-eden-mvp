# Browser Use QA Smoke Test — Local Runner

**Issue:** [ALE-160](https://linear.app/alexgpt/issue/ALE-160)  
**Scope:** Hermes tool/plugin only. Not used in production application.

---

## What is this?

A local Playwright-based QA runner living inside `scripts/browser-use/`. It...

- visits the production (or staging) app via a browser,
- runs smoke tasks against the deployed frontend,
- produces a **markdown report** with PASS/FAIL per task + step,
- captures **screenshots on failure**.

> ⚠️ It is **not** a scraper backend. It does **not** add API routes. It does not bypass platform restrictions.

---

## Quick Start

### 1. Install Chromium (first time only)

```bash
npx playwright install chromium
```

### 2. Copy environment file

```bash
cp .env.browser-use.example .env.browser-use
# Edit .env.browser-use with real test credentials (NEVER commit this file)
```

### 3. Run all smoke tasks

```bash
# With env file (recommended)
npm run smoke:browser

# Or point the env file explicitly
BROWSER_USE_ENV=.env.browser-use npm run smoke:browser
```

### 4. Run a single task

```bash
# run only auth
npx tsx scripts/browser-use/index.ts auth

# run only board
npx tsx scripts/browser-use/index.ts board
```

---

## Environment Variables (`.env.browser-use`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `BROWSER_USE_BASE_URL` | ✅ | — | Target URL (e.g. `https://vietnamese-eden-mvp.vercel.app`) |
| `BROWSER_USE_TEST_EMAIL` | ✅ | — | Login email for test account |
| `BROWSER_USE_TEST_PASSWORD` | ✅ | — | Login password |
| `BROWSER_USE_HEADLESS` | — | `true` | Run browser headless (`false` to see UI) |
| `BROWSER_USE_BROWSER` | — | `chromium` | Browser: `chromium`, `firefox`, `webkit` |
| `BROWSER_USE_SCREENSHOT_DIR` | — | `scripts/browser-use/screenshots` | Screenshot output |

---

## Tasks

| Task | What it checks |
|------|---------------|
| **auth** | Login → dashboard redirect, logout, session persists |
| **board** | Dashboard loads, content cards visible, search input renders |
| **ai-breakdown** | Paste text → save → breakdown page renders, **blue badge** (Paste text) |
| **remix** | Remix button → output generated, **no CJK leakage**, title not generic |
| **voice-profile** | Voice selector renders, options visible |
| **calendar** | Calendar view navigates and renders |
| **m8-source-quality** | YouTube URL → **orange badge**, TikTok/Instagram URL → **red badge** |

---

## Output

- **Console:** real-time PASS/FAIL per step
- **Markdown report:** `scripts/browser-use/screenshots/report-<timestamp>.md`
- **Screenshot on fail:** `scripts/browser-use/screenshots/fail-<task>-<timestamp>.png`

Example report excerpt:

```markdown
# Smoke Report — ALE-160

| Metric | Value |
|--------|-------|
| Total tasks | 7 |
| ✅ PASS | 5 |
| ❌ FAIL | 2 |

## Results

| Task | Status | Summary |
|------|--------|---------|
| auth | ✅ PASS | Login + dashboard OK |
| board | ✅ PASS | Dashboard loads, cards visible |
| ... | ... | ... |
```

---

## Guard Rails

1. **No production code changes** — `scripts/browser-use/` is excluded from `tsconfig.json`.
2. **No API routes added** — runner is purely client-facing browser automation.
3. **No scraper behavior** — tests only verify UI; never scrape content at scale.
4. **No credentials committed** — `.env.browser-use` is in `.gitignore`. `cp .env.browser-use.example .env.browser-use`.
5. **No real account without env** — runner exits early if `BROWSER_USE_BASE_URL` is missing.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `BROWSER_USE_BASE_URL missing` | Copy `.env.browser-use.example` → `.env.browser-use` |
| Chromium not found | `npx playwright install chromium` |
| Task fails on local dev server | Use `http://localhost:3000` as base URL |
| Timeout on slow network | Increase timeout in task file (e.g. `15_000` → `30_000`) |
| Screenshot missing | Ensure `screenshots/` directory is writable |

---

## Architecture

```
scripts/browser-use/
├── index.ts              # runner, report, main
├── types.ts              # SmokeConfig, SmokeResult, SmokeTaskFn
├── config.ts             # load .env.browser-use
├── tasks/
│   ├── auth.ts           # login/logout/session
│   ├── board.ts          # dashboard load
│   ├── ai-breakdown.ts   # paste text + AI badge
│   ├── remix.ts          # remix + no CJK guard
│   ├── voice-profile.ts  # voice selector renders
│   ├── calendar.ts       # calendar view
│   └── m8-source-quality.ts  # M8 badge colors
└── screenshots/          # generated at runtime

.env.browser-use        # gitignored — real credentials
.env.browser-use.example  # committed — template
tsconfig.json             # separate tsconfig for scripts/
```

---

## Related

- [ALE-160 cursor prompt](../cursor-prompt-ale-160.md)
- [Production smoke test log](../production-smoke-test.md)
- [M8 social URL importer plan](../social-url-importer-plan.md)
