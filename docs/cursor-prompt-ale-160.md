# Implementation Plan — ALE-160: Integrate Browser Use as Hermes browser QA tool

**Issue:** [ALE-160](https://linear.app/alexgpt/issue/ALE-160)  
**Scope:** Hermes tool/plugin only. Không động Next.js production app, không dùng làm scraper backend.

---

## 1. Decision recap

| Dùng Browser Use cho | Không dùng Browser Use cho |
|---|---|
| Smoke tests QA qua Hermes | Scraper backend Next.js |
| Screenshot khi fail | TikTok/Instagram bulk scraping |
| Report PASS/FALSE markdown | Transcript engine thay thế API |
| Validate source-quality badges | Bypass platform restrictions |

---

## 2. Architecture

```text
Hermes Agent
    └── tool: browser-use-smoke
            ├── task parser (map acronyms → Browser Use agent tasks)
            ├── domain allowlist guard (production vs localhost)
            ├── Browser Use agent
            │       ├── browser (playwright/chromium)
            │       ├── LLM controller (optional, default headless deterministic)
            │       └── task execution (click, assert, screenshot)
            └── report generator (markdown PASS/FAIL + screenshot embed)
```

**Domain allowlist:**
- `https://vietnamese-eden-mvp.vercel.app` — production smoke
- `http://localhost:3000` — optional dev smoke (flag `--dev`)
- Reject any other URL with hard error before agent launch.

---

## 3. Smoke task list

| # | Flow | Assertions | Criticality |
|---|---|---|---|
| 1 | Auth (test account login) | Login success, redirect to /dashboard, session cookie set | 🔴 Must |
| 2 | Board / Content list | Items load, search/filter work, pagination nếu có | 🟡 Should |
| 3 | AI Breakdown | Paste text → analyze → breakdown rendered with blue badge; no 500 | 🔴 Must |
| 4 | Remix | Remix button visible, generates output, no CJK leakage | 🔴 Must |
| 5 | Voice Profile | Voice selector renders, test voice preview plays | 🟢 Could |
| 6 | Calendar | Calendar view renders, events load | 🟢 Could |
| 7 | M8 source quality | YouTube URL → orange badge + callout; TikTok/Instagram blocked → red badge + manual CTA | 🔴 Must |

---

## 4. Tech stack

| Component | Choice | Rationale |
|---|---|---|
| Browser engine | Browser Use (Playwright wrapper) | Declarative agent tasks, built-in screenshot, deterministic |
| Browser type | Chromium headless | Match Vercel + CI; stable |
| Credentials | `.env` local only (`.env.browser-use`) | Isolated from Next.js `.env`; never committed |
| Report format | Markdown table + base64 PNG inline | Easy paste to Linear/Telegram |
| Runner | `npx tsx scripts/smoke.ts <task>` hoặc Hermes tool | Manual + CI compatible |

---

## 5. Credentials strategy

- Tạo **dedicated test account** trên Vercel deployment (không dùng owner/prod account).
- Lưu credentials trong `.env.browser-use` ở repo root.
- **`.gitignore`:** `.env.browser-use`
- **No inline secrets** in tool call args, logs, or report.
- Rotation policy: test account password rotate mỗi 90 ngày.

---

## 6. Report format

```markdown
### Smoke Report — ALE-160
| Task | Status | Note |
|---|---|---|
| Auth | ✅ PASS | Login redirect OK |
| Board | ✅ PASS | 5 items loaded |
| AI Breakdown | ✅ PASS | Badge blue rendered |
| Remix | ❌ FAIL | CJK leaked (screenshot below) |

**Summary:** 3/4 PASS, 1 FAIL
```

Screenshot khi fail → save to `/tmp/browser-use-fail-<task>-<timestamp>.png` → base64 embed hoặc upload artifact.

---

## 7. Local dev setup (docs)

```bash
# 1. Clone or cd into repo
# 2. Install Browser Use (chỉ dev dependency)
npm install -D @browser-use/core  # or equivalent package name

# 3. Create test account credentials file
cp .env.browser-use.example .env.browser-use
# edit .env.browser-use with test account

# 4. Run full smoke
npx tsx scripts/smoke.ts --url https://vietnamese-eden-mvp.vercel.app

# 5. Run single task
npx tsx scripts/smoke.ts --task auth --url https://vietnamese-eden-mvp.vercel.app

# 6. Dev smoke (optional)
npx tsx scripts/smoke.ts --url http://localhost:3000 --dev
```

---

## 8. Acceptance criteria checklist

- [ ] AC1: Hermes có tool wrapper gọi Browser Use task.
- [ ] AC2: Domain allowlist (production + localhost).
- [ ] AC3: Smoke tasks 1–7 implemented.
- [ ] AC4: Dùng test account riêng.
- [ ] AC5: Report PASS/FAIL markdown.
- [ ] AC6: Screenshot khi fail.
- [ ] AC7: Không commit secrets.
- [ ] AC8: Docs hướng dẫn chạy local.
- [ ] AC9: Không dùng Browser Use làm scraper backend.

---

## 9. Out of scope — guard rails

- KHÔNG tạo API endpoint `/api/scrape` dùng Browser Use.
- KHÔNG tạo cron job bulk scrape TikTok/Instagram.
- KHÔNG dùng Browser Use để lấy transcript thay thế oEmbed/metadata API.
- KHÔNG bypass Cloudflare/WAF bằng stealth mode (không cần thiết cho QA).
- KHÔNG merge vào `main` nếu chưa có `.env.browser-use.example` và entry trong `.gitignore`.

---

**Status:** Plan approved. Ready for Cursor hand-off (no code in this doc).
**Branch suggestion:** `feat/ale-160-browser-use-smoke`
