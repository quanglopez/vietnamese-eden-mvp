# Cursor prompt — ALE-154 M8 Social URL Importer (foundation only)

> **Copy prompt bên dưới và paste vào Cursor chat (Composer/Agent) trong repo `vietnamese-eden-mvp`.**
>
> **Scope:** ALE-154 chỉ là **foundation** — Commit 1 (types + priority helper) + Commit 2 (adapter stubs) của `docs/social-url-importer-plan.md`. **Commit 3 (rewire pipeline) và Commit 4 (docs) thuộc ALE-159 — KHÔNG làm trong issue này.**
>
> **Context bắt buộc đọc trước:** `docs/social-url-importer-plan.md` (sections 3, 4, 5, 9).
> **Linear issue:** [ALE-154](https://linear.app/alexgpt/issue/ALE-154/m8-social-url-importer-architecture-interface-sourcequality-enum)
> **Branch:** `feat/ale-154-social-url-importer-foundation` (tạo từ `main`)

---

## Prompt (copy từ đây)

```
You are implementing ALE-154: M8 Social URL Importer architecture FOUNDATION for the Vietnamese Eden MVP repo.

READ FIRST (mandatory before any code):
- docs/social-url-importer-plan.md — full architecture spec (sections 3, 4, 5, 9 are normative for this issue)
- src/lib/content/url-metadata.ts — existing helpers (extractYouTubeVideoId, buildEnrichedRawContent, resolveThumbnailUrl)
- src/lib/content/enrich-url-content.ts — caller that will be rewired in ALE-159 (NOT in this issue)
- src/lib/content/platform-detect.ts — has detectPlatformFromUrl(url) returning { platform: PlatformType, label: string }
- src/types/content.ts — DB PlatformType enum: "tiktok" | "facebook" | "instagram" | "youtube" | "other"
- .cursorrules — repo coding conventions

GOAL OF THIS ISSUE
Define the contract that M8 importers will implement: TypeScript types, adapter interface, priority helper, and adapter stubs. No new behavior. No new platform integration. The existing URL preview / breakdown flow must keep working exactly as before. Nothing is wired into the app.

SCOPE (do exactly this, no more)
- Commit 1: types + priority helper + index skeleton + unit tests for priority
- Commit 2: 6 adapter stubs (youtube, tiktok, instagram, facebook, linkedin, unknown) + wire registry + canHandle tests

OUT OF SCOPE (will be other issues — DO NOT TOUCH)
- Real YouTube transcript fetch → ALE-155
- Real TikTok oEmbed strategy → ALE-156
- Real Instagram oEmbed strategy → ALE-157
- Source quality badge UI → ALE-158
- Rewiring enrich-url-content.ts / call sites → ALE-159
- DB migration for source_quality column — explicitly chose Option A: NO migration
- Any change to src/lib/content/url-metadata.ts, enrich-url-content.ts, or url-metadata.ts internals
- Any change to BreakdownView, breakdown page, AddContentModal, or any UI component

HARD CONSTRAINTS
1. TypeScript strict — no `any`, no `// @ts-ignore`. No `unknown` escapes for missing fields; use the typed shapes.
2. Zero behavior change in production app. This issue lands types + stubs only. The new code MUST NOT be imported by any existing module.
3. Do NOT touch src/lib/content/url-metadata.ts, enrich-url-content.ts, platform-detect.ts, or any call site. Existing code stays byte-identical.
4. Do NOT add new npm dependencies. Use stdlib + existing project libs only.
5. Do NOT touch DB schema. Option A confirmed: no migration.
6. All copy in JSDoc, error messages, warning messages, test names = Vietnamese (matching repo convention).
7. Test runner is `node:test` (see src/lib/ai/__tests__/language-leak.test.ts for the exact pattern: `import { describe, it } from "node:test"; import assert from "node:assert/strict";`). Run with `node --import tsx --test <path>`. Do NOT introduce vitest/jest.
8. `npm run lint && npm run type-check && npm run build` must all pass before each commit.

PLATFORM → DBMAPPING (important)
The DB `PlatformType` enum (src/types/content.ts) only has 5 values: tiktok | facebook | instagram | youtube | other. The new `SocialPlatform` union in section 3 of the spec also includes "linkedin" and "unknown". When adapter code needs to call existing DB-aware helpers (e.g. `detectPlatformFromUrl`), map accordingly:
  - "linkedin"  → DB "other"
  - "unknown"   → DB "other"
The adapter itself can still return `platform: "linkedin"` on the SocialImportResult — the mapping to DB is a separate concern, deferred to the call site in ALE-159.

DELIVERABLES

### Commit 1 — Types + priority helper

Create these files under `src/lib/content/social-importer/`:

1. `types.ts`
   - `SourceQuality` union: "paste_text" | "transcript" | "caption" | "metadata_only" | "blocked" | "manual_required"
   - `SocialPlatform` union: "youtube" | "tiktok" | "instagram" | "facebook" | "linkedin" | "unknown"
   - `SocialImportWarningCode` union with the 9 codes from spec section 3
   - `SocialImportWarning` interface (code, message, severity)
   - `SocialImportResult` interface VERBATIM from spec section 3 (platform, sourceUrl, canonicalUrl?, title?, author?, thumbnailUrl?, captionText?, transcriptText?, metadataText?, analysisInput?, sourceQuality, warnings, fetchedAt)
   - `SocialUrlImporter` interface (canHandle(url): boolean, import(url): Promise<SocialImportResult>)
   - JSDoc on every exported type/interface, in Vietnamese

2. `priority.ts`
   - `pickAnalysisInput(result: SocialImportResult, pasteText: string | null | undefined): { input: string | null; quality: SourceQuality; warnings: SocialImportWarning[] }`
   - Priority order (high → low, per spec section 4):
     1. `transcriptText` if `length >= 100`
     2. `captionText` if `length >= 50`
     3. `pasteText` if `length >= 50` (caller-provided), quality = "paste_text"
     4. `metadataText` (built from title + author if present), quality = "metadata_only"
     5. else `input = null`, quality = "manual_required", warnings include UNSUPPORTED_URL / METADATA_ONLY depending on what's missing
   - Pure function, no side effects, no I/O
   - If the chosen input is empty/whitespace, fall through to next priority
   - Vietnamese JSDoc + comments

3. `index.ts`
   - `ADAPTERS: SocialUrlImporter[] = []` (empty array for now)
   - `importSocialUrl(url: string): Promise<SocialImportResult>` — throws `new Error("importSocialUrl chưa được kích hoạt — Commit 2 sẽ wire registry")`
   - Re-export public types from `types.ts` and `pickAnalysisInput` from `priority.ts` for ergonomic imports

4. `__tests__/priority.test.ts`
   - Use `node:test` (describe/it) + `node:assert/strict` — match the pattern in `src/lib/ai/__tests__/language-leak.test.ts`
   - Cover all 5 priority paths:
     a) transcript wins over caption/paste/metadata
     b) caption wins over paste when no transcript
     c) paste wins over metadata
     d) metadata wins when nothing else qualifies
     e) all-empty → manual_required with UNSUPPORTED_URL warning
   - Also test: short transcript (< 100 chars) falls through to caption
   - Also test: short caption (< 50 chars) falls through to paste
   - Vietnamese test names
   - Run: `node --import tsx --test src/lib/content/social-importer/__tests__/priority.test.ts`

Verification gate before commit:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds
  - unit tests pass

Commit message: `feat(ALE-154): add M8 social URL importer types + priority helper`

### Commit 2 — Adapter stubs

Create `src/lib/content/social-importer/adapters/` with these files:

1. `base.ts` (optional helper) — `nowIso(): string` returns `new Date().toISOString()` and a small helper `makeWarning(code, message, severity)` that constructs a `SocialImportWarning` with Vietnamese defaults. Keep tiny.

2. `youtube.ts` — `YouTubeImporter implements SocialUrlImporter`
   - `canHandle(url)`: use existing `detectPlatformFromUrl(url).platform === "youtube"` (or fall back to manual hostname check `youtube.com | youtu.be | m.youtube.com`)
   - `import(url)`: returns `SocialImportResult` with:
     - platform = "youtube"
     - sourceUrl = url
     - canonicalUrl = url (no rewrite in foundation; rewrite is Commit 3 / existing url-metadata.ts territory)
     - sourceQuality = "metadata_only"
     - warnings = [{ code: "METADATA_ONLY", message: "Chỉ lấy được metadata — chưa có transcript/caption đầy đủ.", severity: "info" }]
     - title / author / thumbnailUrl / captionText / transcriptText: all `undefined` for now (real fetch happens in ALE-155)
     - fetchedAt = ISO now
   - JSDoc Vietnamese, document that real fetch is deferred

3. `tiktok.ts` — `TikTokImporter`
   - `canHandle`: `detectPlatformFromUrl(url).platform === "tiktok"`
   - `import`: platform = "tiktok", sourceQuality = "blocked", warnings = [{ code: "PLATFORM_BLOCKED", message: "TikTok đang chặn oEmbed từ IP cloud. Hãy dán caption/script bằng Paste text.", severity: "warning" }, { code: "RATE_LIMITED", message: "TikTok oEmbed không đáng tin cậy trên shared egress — tạm thời chặn.", severity: "info" }]

4. `instagram.ts` — `InstagramImporter`
   - `canHandle`: `detectPlatformFromUrl(url).platform === "instagram"`
   - `import`: platform = "instagram", sourceQuality = "blocked", warnings = [{ code: "LOGIN_REQUIRED", message: "Instagram oEmbed yêu cầu đăng nhập — hãy dán caption bằng Paste text.", severity: "warning" }, { code: "PLATFORM_BLOCKED", message: "Không thể scrape Instagram từ server.", severity: "info" }]

5. `facebook.ts` — `FacebookImporter`
   - `canHandle`: `detectPlatformFromUrl(url).platform === "facebook"`
   - `import`: platform = "facebook", sourceQuality = "manual_required", warnings = [{ code: "UNSUPPORTED_URL", message: "Facebook chưa được hỗ trợ trong M8. Hãy dán text bằng Paste text.", severity: "info" }]

6. `linkedin.ts` — `LinkedInImporter`
   - `canHandle`: hostname contains `linkedin.com` (since DB enum doesn't have linkedin, write a small manual check here)
   - `import`: platform = "linkedin", sourceQuality = "manual_required", warnings = [{ code: "UNSUPPORTED_URL", message: "LinkedIn chưa được hỗ trợ trong M8. Hãy dán text bằng Paste text.", severity: "info" }]

7. `unknown.ts` — `UnknownUrlImporter` (fallback, MUST be last)
   - `canHandle`: always returns `true`
   - `import`: platform = "unknown", sourceQuality = "manual_required", warnings = [{ code: "UNSUPPORTED_URL", message: "URL không thuộc platform được hỗ trợ (YouTube/TikTok/Instagram/Facebook/LinkedIn). Hãy dán text bằng Paste text.", severity: "info" }]

8. `__tests__/adapters.test.ts` (or one file per adapter — pick one, prefer combined)
   - For each adapter, test `canHandle` with:
     - A representative URL that should match (e.g. for youtube: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`)
     - A URL that should NOT match (e.g. for youtube: `https://example.com`)
   - For each adapter, test `import()` returns a result with the right `platform`, `sourceQuality`, and at least one warning where required
   - Vietnamese test names
   - Run with `node --import tsx --test`

9. Update `src/lib/content/social-importer/index.ts`:
   - Import all 6 adapter classes
   - Populate `ADAPTERS` array in this exact order: [YouTube, TikTok, Instagram, Facebook, LinkedIn, Unknown]
   - `importSocialUrl(url)`: loop ADAPTERS, return first match; if none (unreachable because Unknown is last), throw with Vietnamese message

Verification gate before commit:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds
  - all unit tests pass (priority + adapters)

Commit message: `feat(ALE-154): add M8 social URL importer adapter stubs`

AFTER EACH COMMIT
- Run `npm run lint && npm run type-check && npm run build`
- Run `node --import tsx --test src/lib/content/social-importer/__tests__/*.test.ts`
- Fix any new errors
- Commit with message format: `<type>(ALE-154): <description>` (types: feat, refactor, docs, test, chore)
- Push to `feat/ale-154-social-url-importer-foundation` after both commits

DONE WHEN (definition of done for ALE-154)
- Both commits pushed to `feat/ale-154-social-url-importer-foundation`
- Zero behavior change in production app (grep verify: no existing file imports the new `social-importer/index.ts`)
- `npm run lint && npm run type-check && npm run build` all pass
- Unit tests: pickAnalysisInput covers all 5 paths; adapter canHandle covers 6×2 = 12 cases
- Existing ALE-152 production smoke flow MUST still work (YouTube watch?v=, /shorts/, TikTok fallback, Paste text) — verify by reading the code paths and confirming no new file is imported anywhere in the existing pipeline
- A PR is opened to main with: summary, deferred-to-ALE-159 note, test results, no behavior change evidence

DO NOT (hard rules)
- DO NOT import the new social-importer module from any existing file in this issue
- DO NOT modify src/lib/content/url-metadata.ts or enrich-url-content.ts
- DO NOT add a DB migration
- DO NOT add new npm packages
- DO NOT create a source-quality badge component (that's ALE-158)
- DO NOT touch AI Breakdown, BreakdownView, AddContentModal, or any UI
- DO NOT run all 4 spec commits — only Commits 1 and 2 land in ALE-154
```

---

## Notes for the human running this in Cursor

1. **Create the feature branch first** before running the prompt:
   ```
   git checkout main && git pull origin main
   git checkout -b feat/ale-154-social-url-importer-foundation
   ```
2. **Run Commits 1 and 2 one at a time** — paste the prompt, let Cursor do Commit 1, review the diff, run lint/type-check/build/tests yourself, then ask Cursor to continue with Commit 2.
3. **Verify no behavior change** before opening the PR:
   ```bash
   # Should return nothing — no existing file imports the new module
   grep -rn "from \"@/lib/content/social-importer" src/ --include="*.ts" --include="*.tsx"
   # Also: any reference outside the new social-importer/ dir itself
   grep -rn "social-importer" src/ --include="*.ts" --include="*.tsx" | grep -v "src/lib/content/social-importer/"
   ```
4. **Do NOT mark ALE-154 Done in Linear** until you've run the verification steps in the PR description and the existing ALE-152 smoke still works on production. ALE-154 is a foundation — the user-visible value comes from ALE-155→159.
5. **ALE-153 guard is already in place** (commit `736ed99`, PR #2). When ALE-155 lands the real YouTube transcript path, the guard will be there to catch leakage in the transcript-quality tier.
