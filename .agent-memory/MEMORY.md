# Project Memory — Vietnamese Eden MVP

## Project Overview

Vietnamese Eden là AI content workspace cho creator Việt.
MVP: board → breakdown → remix → voice → calendar.
Closed beta, pricing feature-flagged off (`NEXT_PUBLIC_PRICING_ENABLED=false`).

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, shadcn/ui, Radix UI
- **Backend**: Next.js API routes + Server Actions
- **Database**: Supabase (PostgreSQL), project `romaiooigximznlrpsze`
- **Auth**: Supabase Auth (email/password)
- **AI**: OpenAI (GPT-4o, GPT-4o-mini) via Vercel AI SDK
- **Deploy**: Vercel
- **CI**: GitHub Actions
- **Package manager**: npm
- **Lint/Type**: ESLint + TypeScript strict

## User Preferences

- Owner dùng Cursor daily, Hermes Agent cho planning/review/smoke
- Giao tiếp: tiếng Việt pha English tech terms
- Ưu tiên token efficiency
- Strict PR review (file-count scope limit, zero scope creep)
- Merge chỉ sau owner confirm
- Không paste API key vào chat

## Current Constraints

- `NEXT_PUBLIC_PRICING_ENABLED=false` — chưa bật Stripe, không có route/webhook thanh toán
- Supabase CLI chưa linked (không có `.supabase/project-ref`)
- Migration phải apply qua Supabase Dashboard SQL Editor
- Vercel Preview deployments có SSO auth — không truy cập được từ browser automation
- `dotenv` truncate value at `#` — password có `#` phải quote trong `.env`

## Known Environment Notes

- **OS**: Windows (10)
- **Shell**: bash (git-bash / MSYS), không dùng PowerShell
- **Python**: python3=3.14.3, python=3.11.15, pip→python3.12
- **Node**: v24.13.0
- **Git**: 2.53.0
- **uv**: 0.11.18 (installed)
- **Docker**: 29.4.3 (available)

## Important Commands

```bash
# Dev
npm run dev

# Quality gates
npm run lint
npm run type-check
npm run build

# Git workflow (tuần tự, có owner confirm)
git add ...
git commit -m "..."
git push -u origin <branch>

# Vercel
# Deploy tự động khi push lên main hoặc mở PR
```

## Common Pitfalls

1. **`dotenv` + `#` trong password**: Giá trị bị truncate. Fix: quote value trong `.env`.
2. **Vercel Preview env vars**: Preview environment KHÔNG tự kế thừa Production env vars. Phải set riêng trong Vercel Dashboard.
3. **Linear auto-close**: Khi merge PR, Linear tự close issue. Không cần gọi `issueUpdate` để move Done.
4. **Supabase CLI chưa linked**: Migration phải chạy thủ công qua Dashboard SQL Editor.
5. **Git bash path**: Dùng `/c/Users/ADMIN/...` hoặc `C:\Users\ADMIN\...` đều được.

## Project Structure (key paths)

```
src/
  app/(app)/           — Authenticated app routes
    admin/              — Admin pages (beta-testers, analytics, feedback, beta-launch)
    dashboard/          — User dashboard
    boards/             — Content boards
  components/custom/    — App-specific components
    admin/              — Admin components
    app/                — App shell (sidebar, etc.)
  lib/                  — Query helpers, utilities
    beta-testers/       — Beta tester queries
    analytics/          — Analytics queries
    beta-launch/        — Beta launch command center queries (ALE-176)
    feedback/           — Feedback queries
  types/                — Shared TypeScript types
docs/                   — Project documentation
.agent-memory/          — Agent memory files (this folder)
scripts/                — Utility scripts
```
