# Browser Use QA Smoke Suite

Playwright-based production smoke tests for Vietnamese Eden MVP.

## Setup

1. Copy `.env.browser-use.example` to `.env.browser-use`:
   ```bash
   cp .env.browser-use.example .env.browser-use
   ```
2. Fill in `BROWSER_USE_TEST_EMAIL` and `BROWSER_USE_TEST_PASSWORD` with test account credentials.
3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Run

```bash
# Run all tasks
npx tsx scripts/browser-use/index.ts

# Run specific tasks
npx tsx scripts/browser-use/index.ts auth board tags

# Non-headless (watch browser)
BROWSER_USE_HEADLESS=false npx tsx scripts/browser-use/index.ts auth
```

## Tasks

| Task | Description |
|------|-------------|
| `auth` | Login + session cookie verify |
| `board` | Board list + content cards on dashboard |
| `ai-breakdown` | AI breakdown page sections |
| `remix` | Remix form + output |
| `voice-profile` | Voice profile setup |
| `calendar` | Calendar section |
| `m8-source-quality` | M8 source quality badges |
| `tags` | ALE-162 tag manager CRUD + filter + regression |
| `saved-views` | ALE-163 saved board views CRUD + regression |
| `content-detail` | ALE-165 content detail / breakdown page sections |

## Environment

- **Target**: `https://vietnamese-eden-mvp.vercel.app` (production)
- **Allowed domains** enforced in `config.ts`
- **Credentials**: `.env.browser-use` (gitignored, never commit)
- **Screenshots**: `screenshots/` (gitignored, generated on failure)

## Adding a new task

1. Create `tasks/your-task.ts` with a default export matching the `SmokeTaskFn` signature:
   ```ts
   import type { SmokeContext, SmokeResult } from "../types";
   export default async function runYourTask(context: SmokeContext): Promise<SmokeResult> { ... }
   ```
2. Add an entry to the `TASKS` map in `index.ts`:
   ```ts
   "your-task": () => import("./tasks/your-task"),
   ```
3. Run: `npx tsx scripts/browser-use/index.ts your-task`
