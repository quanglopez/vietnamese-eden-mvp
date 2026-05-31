# Supabase — Vietnamese Eden MVP

## Schema (ALE-63)

ERD + documentation: [`docs/database/ERD.md`](../docs/database/ERD.md)

10 bảng chính: `profiles`, `workspaces`, `workspace_members`, `boards`, `content_items`, `board_content_items`, `content_analyses`, `voice_profiles`, `generated_outputs`, `content_calendar_items`

Migrations (apply in order):

1. `20260530120000_health_check.sql`
2. `20260530130000_initial_schema.sql`
3. `20260531120000_beta_waitlist.sql`

Deploy Vercel + Cloud: [`docs/deploy-checklist.md`](../docs/deploy-checklist.md)

## Local development (Docker)

```bash
# Start local Supabase stack
npm run supabase:start

# Apply migrations + seed
npm run supabase:reset

# Test connection (uses .env.local)
npm run supabase:test
```

Local credentials (default) are written to `.env.local` after `supabase start`:

- API URL: `http://127.0.0.1:54321`
- Studio: `http://127.0.0.1:54323`

Run `npx supabase status` to view keys anytime.

## Cloud (dev / beta)

1. Create a **dev** project at [supabase.com/dashboard](https://supabase.com/dashboard) (do not use production data dumps)
2. Apply all migrations — see [`docs/deploy-checklist.md`](../docs/deploy-checklist.md)
3. Configure **Auth redirect URLs** for local + Vercel domains
4. Copy **Project URL** and **anon key** into Vercel env (and `.env.local` for local testing against Cloud)
5. Verify: `npm run supabase:test` or `GET /api/health/supabase`

## Environment variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Public anon key (RLS enforced) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Service role — never expose to client |

## Client modules

| Module | Use case |
|--------|----------|
| `@/lib/supabase/client` | Client Components (browser) |
| `@/lib/supabase/server` | Server Components, Route Handlers |
| `@/lib/supabase/admin` | Server-only admin ops (service role) |
| `@/lib/supabase/health-check` | Connection probe query |

## RLS

Migration `20260530120000_health_check.sql` enables RLS on `public.health_check`:

- `anon` / `authenticated`: **SELECT** only
- **INSERT/UPDATE/DELETE**: denied for public roles
