# Vietnamese Eden MVP — Kanban Working Agreement

> Set up: 2026-06-02, after ALE-163 production smoke PASS (commit `633b2f3`).
> Repo: `C:\Users\ADMIN\vietnamese-eden-mvp`
> Production: `https://vietnamese-eden-mvp.vercel.app`
> GitHub: `quanglopez/vietnamese-eden-mvp`
> Linear team: Vietnamese Eden MVP (Alexgpt)

## 1. Roles (one profile = one role, not a dev branch)

| Profile | Scope | Hard rules |
|---|---|---|
| `eden-orchestrator` | Decompose, route, track, handoff | No app code, no merge, no production migration apply |
| `eden-product` | Read Linear/docs, write acceptance + `docs/cursor-prompt-ale-xxx.md` | No app code edits |
| `eden-reviewer` | PR diff, migration SQL/RLS/query/server actions, security/regression risk; hotfix prompt for Cursor | No large code rewrites |
| `eden-qa` | `lint`/`type-check`/`build`, smoke local/preview/production | Never mark PASS without verification; distinguish automation issue vs product bug |
| `eden-docs` | `docs/project-status.md`, `docs/production-smoke-test.md`, changelog, status handoff | No app code |
| `eden-developer-guarded` | Code path analysis + patch proposal only | No commit/push/merge. **Cursor remains primary implementer** |

> Each role is enforced via `hermes profile create --description "..."`, consumed by Kanban decomposer for routing.

## 2. Definition of Done (DoD)

- **Code/build task:** `npm run lint` PASS, `npm run type-check` PASS, `NODE_OPTIONS=--max-old-space-size=8192 npm run build` PASS.
- **PR task:** scope đúng (no file ngoài scope), no secrets, review PASS.
- **Migration task:** SQL reviewed, target Supabase confirmed, migration applied, schema/RLS verified.
- **Production task:** Vercel deploy READY, authenticated production smoke PASS.
- **Linear Done:** only after smoke PASS, NOT just because PR merged.

## 3. Migration Gate (HARD)

- ❌ No merge PR with migration before SQL is reviewed by `eden-reviewer`.
- ❌ No move `Done` if migration not applied to target environment.
- ❌ No production smoke if Vercel deploy not READY.

## 4. Branch / PR / Commit convention

- Branch: `feat/ale-XXX-slug` or `fix/ale-XXX-slug`.
- PR file cap: respect the per-issue scope (e.g. ALE-163 = 7 files). No Browser Use uncommitted files, no `.env`, no AI provider/prompt files, no unrelated migration in PR diff.
- Commit messages: `feat(ALE-163): <short>`, `fix(ALE-163): <short>`, `docs(ALE-163): <short>`.

## 5. Task naming convention

- Title format: `ALE-XXX: <short slug>`.
- **Priority:**
  - `1` = blocker / current issue
  - `2` = required for current milestone
  - `3` = backlog / next
- **Tenant:** `vietnamese-eden`
- **Assignee:** one of the 6 `eden-*` profiles.

## 6. Hermes Kanban command cheatsheet

```bash
# Board
hermes kanban boards switch vietnamese-eden-mvp
hermes kanban --board vietnamese-eden-mvp list
hermes kanban --board vietnamese-eden-mvp stats
hermes kanban --board vietnamese-eden-mvp assignees

# Task lifecycle
hermes kanban --board vietnamese-eden-mvp create --title "ALE-XXX: ..." --assignee eden-... --priority 1 --tenant vietnamese-eden --body "..."
hermes kanban --board vietnamese-eden-mvp claim <task_id>
hermes kanban --board vietnamese-eden-mvp comment <task_id> --body "..."
hermes kanban --board vietnamese-eden-mvp complete <task_id>

# Gateway (messaging + embedded Kanban dispatcher)
hermes gateway status
```

## 7. Linear Done workflow (do NOT shortcut)

1. Code + build + review PASS.
2. Cursor implement → branch → PR.
3. Hermes review (code + migration if any).
4. User manually verifies local smoke.
5. Merge PR (Hermes does NOT auto-merge).
6. Apply migration manually via Supabase Dashboard (Hermes does NOT auto-apply).
7. Wait for Vercel deploy READY.
8. `eden-qa` runs authenticated production smoke.
9. User verifies final results manually.
10. `eden-orchestrator` posts final comment to PR + Linear, **then** ticket is moved to Done.

> **Hermes never moves Linear to Done on its own. Final move is always user-driven.**
