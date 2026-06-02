# Cursor prompt — ALE-158 M8 Source quality badges for AI Breakdown

> **Copy prompt bên dưới và paste vào Cursor chat (Composer/Agent) trong repo `vietnamese-eden-mvp`.**
>
> **Scope:** ALE-158 chỉ là **UI badge + helper mapping** — không rewire pipeline, không implement transcript thật. Dùng dữ liệu hiện tại để suy luận `sourceQuality`.
>
> **Context bắt buộc đọc trước:** `docs/social-url-importer-plan.md` (section 6 — badge table), `src/components/ui/badge.tsx` (shadcn Badge cva).
> **Linear issue:** [ALE-158](https://linear.app/alexgpt/issue/ALE-158/m8-source-quality-badges-for-ai-breakdown)
> **Branch:** `feat/ale-158-source-quality-badges`

---

## Prompt (copy từ đây)

```
You are implementing ALE-158: M8 Source quality badges for AI Breakdown in the Vietnamese Eden MVP repo.

READ FIRST (mandatory before any code):
- docs/social-url-importer-plan.md — section 6 (badge spec table)
- src/components/ui/badge.tsx — shadcn/ui Badge component (cva variants: default/secondary/destructive/outline/ghost/link)
- src/components/custom/breakdown/breakdown-view.tsx — Breakdown page layout (where badge lives)
- src/components/custom/breakdown/breakdown-sections.tsx — BreakdownStatusBanner component
- src/components/custom/boards/content-item-card.tsx — Content card (where badge lives)
- src/lib/content/social-importer/types.ts — SourceQuality union + SocialImportWarning type
- src/lib/content/social-importer/priority.ts — pickAnalysisInput (for reference, not to import)
- src/lib/content/url-metadata.ts — buildEnrichedRawContent (see the metadata marker string it writes)
- src/types/content.ts — BoardContentItem / ContentItemDetail types (no sourceQuality field yet)
- .cursorrules — repo conventions

GOAL OF THIS ISSUE
Show the user what quality of text the AI Breakdown is working from — before ALE-159 rewires the pipeline. The badge uses a **pure helper that infers sourceQuality from the current data model**, so no DB migration needed yet.

OUT OF SCOPE
- Rewiring enrich-url-content.ts / importing social-importer from existing code → ALE-159
- Real transcript fetch → ALE-155 (already has a disabled seam)
- DB migration for sourceQuality column → deferred (Option A)
- Any change to social-importer adapters, types, or priority helper
- Any change to AI Breakdown generation logic, prompts, or validator

HARD CONSTRAINTS
1. TypeScript strict — no `any`.
2. Extend the existing shadcn/ui `Badge` via `cva` — do not write a raw <span> with Tailwind.
3. Do NOT import the `social-importer` module from any existing UI component. Only the new badge component may import it for type references; existing components import only the badge component.
4. Do NOT touch `url-metadata.ts`, `enrich-url-content.ts`, `platform-detect.ts`, or any call site in the AI pipeline.
5. Do NOT add new npm dependencies.
6. Do NOT change DB schema. No migration.
7. All copy = Vietnamese (badge labels, tooltips, callout text, test names).
8. `npm run lint && type-check && build` pass before each commit.

DELIVERABLES

### Commit 1 — Badge component + variant mapping helper

1. **Extend `src/components/ui/badge.tsx`** (or create `src/components/ui/badge-extended.tsx` if you prefer not to modify the shadcn primitive):
   Add new `sourceQuality` cva variants to the Badge component:
   - `transcript`    → green bg (#22c55e / green-500) + white text
   - `caption`       → yellow bg (#eab308 / yellow-500) + dark text
   - `paste_text`    → blue bg (#3b82f6 / blue-500) + white text
   - `metadata_only` → orange bg (#f97316 / orange-500) + white text
   - `blocked`       → red bg (#ef4444 / red-500) + white text
   - `manual_required` → same visual as `blocked`
   
   Implementation options (pick ONE):
   - Option A: Add the 6 variants directly to the existing `badgeVariants` cva in `badge.tsx` (cleanest, no extra file)
   - Option B: Create `src/components/custom/breakdown/source-quality-badge.tsx` that wraps `Badge` and uses `cn()` with override classes (more isolated, avoids touching shadcn primitive)
   
   I recommend **Option A** because it's simpler and the badge variants are additive (no breaking change to existing usage). But if you choose Option B, document clearly in JSDoc.

2. **Create `src/lib/content/analysis-source-quality.ts`** (pure helper, no React, no side effects):
   ```ts
   export function getSourceQualityFromItem(
     item: Pick<BoardContentItem | ContentItemDetail, "rawContent" | "sourceUrl" | "platform">,
   ): SourceQuality {
     // Heuristic mapping from current data model (no sourceQuality field yet):
     //
     // 1. "paste_text" — item.rawContent exists and is substantial (>= 100 chars),
     //    and item.sourceUrl is null (user explicitly pasted text, not from URL).
     // 2. "metadata_only" — item.sourceUrl exists and rawContent contains the
     //    marker "[Metadata tự động từ link" (from buildEnrichedRawContent in url-metadata.ts).
     //    OR item.sourceUrl exists but rawContent is empty/null (URL-only card before enrich).
     // 3. "blocked" — item.platform is "tiktok" or "instagram" AND rawContent is empty/null.
     //    (These platforms currently return blocked in the adapter stubs.)
     // 4. "manual_required" — fallback: item has neither sourceUrl nor rawContent.
     //    (Should not happen in normal flow; defensive only.)
     //
     // "transcript" and "caption" are NEVER returned in current state because
     // no real transcript/caption fetch exists yet (ALE-155 seam is disabled).
     // When ALE-159 wires the pipeline, this helper will be replaced by a
     // direct field read from content_items.source_quality (future migration).
   }
   ```
   Add `getSourceQualityLabel(quality: SourceQuality): string` that returns the Vietnamese label from the spec table.
   Add `getSourceQualityDescription(quality: SourceQuality): string | null` that returns the optional sub-text (e.g. for `metadata_only` → the warning copy; for `blocked` → the CTA copy).

3. **Create `src/components/custom/breakdown/source-quality-badge.tsx`**:
   ```tsx
   export function SourceQualityBadge({
     quality,
     showDescription = false,
   }: {
     quality: SourceQuality;
     showDescription?: boolean;
   })
   ```
   Renders:
   - The Badge with the correct cva variant + label
   - If `showDescription` and description exists: a small <span> or <p> below the badge with the sub-text in muted color
   - Tooltip (using `title` attribute or a lightweight shadcn Tooltip if available — do NOT add new dependencies; `title` is acceptable): shows `getSourceQualityDescription(quality)` on hover
   
   For `metadata_only`: render an inline callout (yellow border, yellow bg at 5% opacity) with the text:
   "Kết quả này dựa trên metadata/description, chưa phải transcript đầy đủ. Để phân tích sâu hơn, hãy dán caption/script qua Paste text."
   
   For `blocked`/`manual_required`: render a red callout with:
   "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text."
   + a link button to the board (use the same pattern as the existing amber callout in BreakdownView).

4. **Unit tests** `src/lib/content/__tests__/analysis-source-quality.test.ts`:
   Use `node:test` + `node:assert/strict` (match existing test pattern).
   - Test each heuristic path:
     a) paste_text: rawContent ≥ 100 chars, sourceUrl = null
     b) metadata_only: sourceUrl present, rawContent contains "[Metadata tự động từ link"
     c) metadata_only: sourceUrl present, rawContent = null
     d) blocked: platform = "tiktok", sourceUrl present, rawContent = null
     e) blocked: platform = "instagram", sourceUrl present, rawContent = null
     f) manual_required: both fields null
     g) paste_text wins over metadata_only when both conditions met (edge case: user pasted text on a URL card — rawContent is long and no marker)
   - Test label mapping: each quality returns correct Vietnamese string
   - Test description mapping: metadata_only and blocked return non-null; others return null

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds
  - unit tests pass

Commit message: `feat(ALE-158): add SourceQualityBadge component + getSourceQualityFromItem helper`

### Commit 2 — Render badge on Breakdown page

1. **Modify `src/components/custom/breakdown/breakdown-view.tsx`**:
   - Import `getSourceQualityFromItem` from `analysis-source-quality.ts` (pure TS, no React — safe to import)
   - Import `SourceQualityBadge` from `source-quality-badge.tsx`
   - Compute `const sourceQuality = getSourceQualityFromItem(item)` near the top of the component
   - Render `SourceQualityBadge` right **below** the `BreakdownStatusBanner` (inside the same content column, before the sections)
   - For `metadata_only`: the badge already renders its own yellow callout (handled by `SourceQualityBadge` with `showDescription={true}`)
   - For `blocked`/`manual_required`: badge renders its own red callout. **Remove or simplify the existing amber callout** (lines 103-115 — the "Chưa thể phân tích bằng AI" block) by replacing it with the badge's red callout when quality is `blocked`/`manual_required`. If quality is not blocked, keep the existing `!canAnalyze` logic as-is (it's still valid for other edge cases).
   
   Important: the `!canAnalyze` amber block and the `blocked`/`manual_required` badge callout are the same semantic state. Consolidate them — don't show both. When `sourceQuality` is `blocked`/`manual_required`, render the badge callout instead of the amber block. When `sourceQuality` is something else but `!canAnalyze` (rare edge case), keep the amber block as fallback.

2. **Tests for BreakdownView badge rendering**:
   If you can write a lightweight React test with `node:test` (rendering to string or using a minimal test renderer), add one. If not, skip — the unit tests for the helper + the Badge component are sufficient.

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-158): render SourceQualityBadge on Breakdown page`

### Commit 3 — Render badge on content card

1. **Modify `src/components/custom/boards/content-item-card.tsx`**:
   - Import `getSourceQualityFromItem` + `SourceQualityBadge`
   - Compute `const sourceQuality = getSourceQualityFromItem(item)`
   - Render a small `SourceQualityBadge` above the "Phân tích AI" button (inside the card, below the thumbnail/author section)
   - Use `showDescription={false}` on the card (keep it compact — just the colored badge with label)
   - Only show if `sourceQuality` is NOT `paste_text` (paste_text is the default happy path, no need to badge it on the card). Show for `metadata_only`, `blocked`, `manual_required`.

2. **No test needed** for card rendering (the helper + badge tests cover the logic; visual regression is manual smoke).

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-158): render SourceQualityBadge on content card`

### Commit 4 — Docs polish

1. Inline JSDoc on `getSourceQualityFromItem`, `SourceQualityBadge`, badge variant additions
2. Update `docs/known-limitations.md` if needed (badge is a new feature, not a limitation)
3. No code changes

Commit message: `docs(ALE-158): JSDoc + comments for source quality badges`

AFTER EACH COMMIT
- `npm run lint && npm run type-check && npm run build`
- `node --import tsx --test src/lib/content/__tests__/analysis-source-quality.test.ts`
- Commit format: `<type>(ALE-158): <description>`

DONE WHEN (definition of done)
- All 4 commits pushed to `feat/ale-158-source-quality-badges`
- Breakdown page shows badge with correct color + label for:
  - Paste text items → blue "Paste text" badge
  - YouTube metadata-only items → orange "Metadata only" badge + yellow callout
  - TikTok/Instagram blocked items → red "Cần dán thủ công" badge + red callout + link to board
- Content card shows compact badge (no description) for metadata_only / blocked / manual_required
- `npm run lint + type-check + build` all pass
- Unit tests: 7+ cases for getSourceQualityFromItem heuristic
- No production regression: Paste text flow, URL preview flow, Breakdown generation all still work
- A PR is opened to `main` with smoke evidence (screenshots or manual check list)

MANUAL SMOKE (before marking Done)
1. YouTube `watch?v=…` card → content card shows orange "Metadata only" badge
2. YouTube `watch?v=…` breakdown → orange badge + yellow callout below status banner
3. Paste text item → blue "Paste text" badge on both card and breakdown
4. TikTok card → red "Cần dán thủ công" badge + red callout
5. YouTube Shorts → same as watch?v= (metadata_only)
6. Existing URL thumbnail still loads
7. AI Breakdown still generates (no pipeline change)
8. ALE-153 leakage guard still works (no regression)
```

---

## Notes for the human running this in Cursor

1. **Create the feature branch first:**
   ```
   git checkout main && git pull origin main
   git checkout -b feat/ale-158-source-quality-badges
   ```
2. **Run each commit one at a time** — let Cursor do Commit 1, review diff, verify lint/build/tests, then ask for Commit 2.
3. **The heuristic is the critical piece** — it must correctly identify:
   - Paste text: look for long `rawContent` + no `sourceUrl`
   - Metadata-only: look for the `[Metadata tự động từ link` marker in `rawContent` OR `sourceUrl` with empty `rawContent`
   - Blocked: TikTok/Instagram with no content
4. **Badge colors:** Use the exact Tailwind colors from the spec table. Do not invent new colors.
5. **Do NOT mark ALE-158 Done** until you've run the 8-step manual smoke and all pass. ALE-159 (pipeline rewire) is next after this.
