# Status update template

Sau khi **hoàn thành một Linear issue** (hoặc một đợt smoke/deploy quan trọng), điền block dưới và **merge** vào [project-status.md](./project-status.md).

**Không** ghi secret, API key, hoặc nội dung `.env.local`.

---

## Copy-paste block

```markdown
### Status update — YYYY-MM-DD — [ISSUE-ID] Short title

**Completed by:** (agent / human)  
**Linear:** [ISSUE-ID] — (Done / In review)

#### Production URL
https://vietnamese-eden-mvp.vercel.app/

#### Latest completed issue
- **Issue:** [ISSUE-ID] — one-line description
- **Outcome:** (PASS / PARTIAL / BLOCKED) — 1–3 bullets
- **Docs updated:** (file paths)

#### Latest commit
- **SHA:** `________`
- **Message:** `________`
- **Branch:** `main` | `feature/...`
- **Pushed:** yes | no | local only

#### Beta readiness
| Scope | Status |
|-------|--------|
| Landing + waitlist | Ready / Not ready |
| Auth (signup/login) | Ready / Not ready |
| Full MVP app flow | Ready / Not ready |
**One-line verdict:**

#### Open blockers
| Priority | Blocker | Action |
|----------|---------|--------|
| P0 | | |
| P1 | | |

(remove table rows if none)

#### Next recommended issue
- **[ISSUE-ID]** — (what to do next)

#### Last verify commands
| Command | Result |
|---------|--------|
| `npm run lint` | Pass / Fail / Skipped (docs only) |
| `npm run type-check` | Pass / Fail / Skipped |
| `npm run build` | Pass / Fail / Skipped |
| Production smoke | (link to production-smoke-test.md section) |

#### Notes for ChatGPT
- (anything non-obvious: env flags, migration pending, deploy lag, etc.)
```

---

## Merge checklist

1. Paste block vào **Changelog** cuối `project-status.md` (hoặc thay các mục **At a glance** tương ứng).
2. Cập nhật **Cập nhật lần cuối** date ở đầu `project-status.md`.
3. Nếu có smoke test mới → thêm section trong [production-smoke-test.md](./production-smoke-test.md).
4. Nếu migration mới → cập nhật [supabase/README.md](../supabase/README.md) danh sách migration.
5. Chỉ chạy `npm run lint` / `type-check` / `build` khi **có thay đổi code**; ghi rõ "Skipped (docs only)" nếu không chạy.

---

## Example (filled) — ALE-83

```markdown
### Status update — 2026-05-31 — ALE-83 Full MVP production E2E smoke

**Completed by:** Cursor agent  
**Linear:** ALE-83 — Done (documented)

#### Production URL
https://vietnamese-eden-mvp.vercel.app/

#### Latest completed issue
- **Issue:** ALE-83 — Full MVP production E2E smoke
- **Outcome:** PARTIAL — public + auth PASS; board/AI/calendar blocked by workspace RLS
- **Docs updated:** `docs/production-smoke-test.md` (ALE-83 section)

#### Latest commit
- **SHA:** `f2ae254`
- **Message:** `docs: update production smoke test after waitlist migration`
- **Branch:** `main`
- **Pushed:** yes (ALE-83 doc + migration #4 may be local uncommitted)

#### Beta readiness
| Scope | Status |
|-------|--------|
| Landing + waitlist | Ready |
| Auth (signup/login) | Ready |
| Full MVP app flow | Not ready |
**One-line verdict:** Marketing beta OK; app MVP blocked until workspace RLS fix on Cloud.

#### Open blockers
| Priority | Blocker | Action |
|----------|---------|--------|
| P0 | Workspace insert RLS on production | Apply `20260531140000_workspace_owner_select.sql` |

#### Next recommended issue
- **ALE-84** — Apply workspace migration + full MVP production retest + AI verify

#### Last verify commands
| Command | Result |
|---------|--------|
| `npm run lint` | Pass (prior code session) |
| `npm run type-check` | Pass |
| `npm run build` | Pass |
| Production smoke | ALE-83 in production-smoke-test.md |

#### Notes for ChatGPT
- Migration #4 exists in repo but may not be applied on Supabase Cloud yet.
- Email confirm appears OFF on dev Supabase project (signup → dashboard directly).
```
