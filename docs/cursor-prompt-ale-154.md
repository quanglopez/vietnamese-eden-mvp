# Cursor prompt — ALE-154 M8 Social URL Importer architecture (foundation only)

> **Copy prompt bên dưới và paste vào Cursor chat (Composer/Agent) trong repo `vietnamese-eden-mvp`.**
>
> **Context bắt buộc đọc trước:** `docs/social-url-importer-plan.md` (full spec).
> **Linear issue:** [ALE-154](https://linear.app/alexgpt/issue/ALE-154/m8-social-url-importer-architecture-interface-sourcequality-enum)

---

## Prompt (copy từ đây)

```
You are implementing ALE-154: M8 Social URL Importer architecture foundation for the Vietnamese Eden MVP repo.

READ FIRST (mandatory before any code):
- docs/social-url-importer-plan.md — full architecture spec (sections 3-9 are normative)
- src/lib/content/url-metadata.ts — current code to keep backward-compatible
- src/lib/content/enrich-url-content.ts — caller that will be rewired in Commit 3 (NOT in this issue)
- src/lib/content/platform-detect.ts — existing platform detection
- .cursorrules — repo coding conventions

GOAL OF THIS ISSUE
Define the contract (TypeScript types + adapter interface + priority helper + adapter stubs) that M8 importers will implement. No new behavior. No new platform integration. The existing URL preview / breakdown flow must keep working exactly as before.

OUT OF SCOPE (will be other issues)
- Real YouTube transcript fetch -> ALE-155
- Real TikTok oEmbed strategy -> ALE-156
- Real Instagram oEmbed strategy -> ALE-157
- Source quality badge UI -> ALE-158
- Rewiring AI Breakdown call site -> ALE-159
- DB migration for source_quality column (we explicitly chose Option A: no migration)

HARD CONSTRAINTS
1. TypeScript strict — no `any`. No `// @ts-ignore`.
2. Zero behavior change in production app. This issue lands types + stubs only.
3. Do NOT touch src/lib/content/url-metadata.ts or enrich-url-content.ts or any call site. They will be rewired in a later issue (Commit 3 of the spec).
4. Do NOT add new npm dependencies. Use stdlib + existing project libs.
5. Do NOT touch DB schema. Confirmed Option A — no migration.
6. All copy in JSDoc, error messages, test names = Vietnamese (matching repo convention).
7. npm run lint && npm run type-check && npm run build must all pass before commit.

DELIVERABLES (4 commits — keep them small and reviewable)

### Commit 1 — Types + priority helper
Create:
- src/lib/content/social-importer/types.ts
  - SourceQuality union (paste_text | transcript | caption | metadata_only | blocked | manual_required)
  - SocialPlatform union (youtube | tiktok | instagram | facebook | linkedin | unknown)
  - SocialImportWarningCode union (9 codes listed in spec section 3)
  - SocialImportWarning interface
  - SocialImportResult interface (verbatim from spec section 3)
- src/lib/content/social-importer/priority.ts
  - `pickAnalysisInput(result, pasteText)` — pure function, returns { input, quality, warnings } per spec section 4
  - Vietnamese comments
- src/lib/content/social-importer/index.ts
  - `importSocialUrl()` skeleton that throws "not implemented" (will be wired in Commit 2)
  - Empty `ADAPTERS: SocialUrlImporter[]` array
- src/lib/content/social-importer/__tests__/priority.test.ts
  - Unit tests for pickAnalysisInput covering all 5 source paths
  - Use vitest (project uses vitest? if not, use whatever test runner is in package.json — match the project)

### Commit 2 — Adapter stubs
Create (all in src/lib/content/social-importer/adapters/):
- youtube.ts — YouTubeImporter
  - canHandle: youtube.com / youtu.be / m.youtube.com hosts (use existing detectPlatformFromUrl)
  - import: returns SocialImportResult with platform=youtube, sourceQuality=metadata_only for now, title/author/thumbnailUrl from existing fetchUrlEmbedMetadata if available (delegating call is OK — it's the same logic, just wrapped)
  - 1 warning METADATA_ONLY
- tiktok.ts — TikTokImporter
  - canHandle: tiktok.com hosts
  - import: returns SocialImportResult with sourceQuality=blocked, 1 warning PLATFORM_BLOCKED
  - Vietnamese warning message
- instagram.ts — InstagramImporter
  - canHandle: instagram.com hosts
  - import: sourceQuality=blocked, warning PLATFORM_BLOCKED + LOGIN_REQUIRED
- facebook.ts — FacebookImporter stub
  - canHandle: facebook.com / fb.com / fb.watch
  - import: sourceQuality=manual_required, warning UNSUPPORTED_URL
- linkedin.ts — LinkedInImporter stub
  - Same as facebook
- unknown.ts — UnknownUrlImporter (fallback)
  - canHandle: always returns true
  - import: platform=unknown, sourceQuality=manual_required, warning UNSUPPORTED_URL
- index.ts — register all adapters in ADAPTERS list, ordered most-specific first
- Wire importSocialUrl() in src/lib/content/social-importer/index.ts to actually use the registry

Test: each adapter canHandle on a representative URL (one .test.ts per adapter or combined).

### Commit 3 — Wire into existing pipeline (the BEHAVIOR-CHANGING commit)
- src/lib/content/enrich-url-content.ts
  - Replace direct `fetchUrlEmbedMetadata(sourceUrl)` call with `importSocialUrl(sourceUrl)`
  - Map `SocialImportResult` back to existing `UrlEmbedMetadata` shape for backward compat (title/author/thumbnailUrl/description). If description missing, fall back to metadataText concatenation.
  - Update `buildEnrichedRawContent` to include sourceQuality line in raw_content
- DO NOT touch BreakdownView, breakdown page, or any UI component
- DO NOT change the existing url-metadata.ts public API (keep fetchUrlEmbedMetadata working, just have it internally delegate to importSocialUrl for the YouTube path)

Verify smoke (manual or via test): YouTube watch?v=, /shorts/, TikTok fallback, Paste text flow all still work.

### Commit 4 — Docs + inline JSDoc polish
- JSDoc on every exported function/class/interface in src/lib/content/social-importer/
- Update docs/known-limitations.md if Commit 3 changed any user-visible behavior (likely not)
- Commit message: `docs: JSDoc + minor cleanup for M8 social-importer foundation`

AFTER EACH COMMIT
- Run npm run lint && npm run type-check && npm run build
- Fix any new errors
- Commit with message format: `<type>(ALE-154): <description>` (types: feat, refactor, docs, test, chore)

DONE WHEN
- All 4 commits pushed (or ready to push) to a feature branch
- PR description summarizes: what landed, what was deferred to ALE-155/156/157, smoke evidence
- ALE-154 ready to be marked Done in Linear after smoke verification on a URL set: YouTube watch?v=, YouTube /shorts/, TikTok, Instagram, unknown URL, Paste text — all must produce same result as before Commit 3
```

---

## Notes for the human running this in Cursor

1. **Create a feature branch first** before running the prompt, e.g. `git checkout -b feat/ale-154-m8-foundation`
2. **Run the 4 commits one at a time in Cursor** — paste the prompt, let Cursor do Commit 1, review the diff, then ask it to continue with Commit 2. Don't let it run all 4 in one shot.
3. **Manual smoke before marking ALE-154 Done**:
   - YouTube `watch?v=3Bfx4osqbfE` -> metadata only, no transcript claim
   - YouTube `/shorts/UZSEmfaNRqg` -> metadata only
   - TikTok `vt.tiktok.com/ZSx7CSdfS/` -> `sourceQuality=blocked`, paste text CTA
   - Instagram public post -> `sourceQuality=blocked`
   - Random `https://example.com/article` -> `sourceQuality=manual_required`
   - Paste text flow unchanged
4. **After ALE-154 Done**, create sub-task / discussion in Linear about whether to:
   - Do ALE-153 (P1 leakage guard) next, OR
   - Go directly to ALE-155 (YouTube importer real impl) and apply leakage guard later
   My recommendation: **ALE-153 first** (it's a 1-issue prerequisite, small, makes all importers safe)
