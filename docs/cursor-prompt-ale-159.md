# Cursor prompt — ALE-159 M8 URL Analysis Pipeline using best available source

> **Copy prompt bên dưới và paste vào Cursor chat (Composer/Agent) trong repo `vietnamese-eden-mvp`.**
>
> **Scope:** ALE-159 là **rewire production pipeline** — URL-only content giờ đi qua `importSocialUrl()` + `pickAnalysisInput()` thay vì hardcode `fetchUrlEmbedMetadata`.
>
> **Context bắt buộc đọc trước:**
> - `docs/social-url-importer-plan.md` (section 3 – 9)
> - `src/lib/content/enrich-url-content.ts` (current enrichment logic)
> - `src/lib/content/social-importer/index.ts` (registry + `importSocialUrl`)
> - `src/lib/content/social-importer/priority.ts` (`pickAnalysisInput`)
> - `src/lib/content/social-importer/types.ts` (`SocialImportResult`, `SourceQuality`)
> - `src/app/(app)/breakdown/[contentItemId]/page.tsx` (Breakdown page — enrichment + rendering)
> - `src/components/custom/breakdown/breakdown-view.tsx` (`BreakdownView` props)
> - `src/components/custom/breakdown/source-quality-badge.tsx` (badge from ALE-158 — props: `{ quality }`)
> - `src/components/custom/breakdown/breakdown-sections.tsx` (`BreakdownStatusBanner`)
> - `src/lib/content/analysis-source-quality.ts` (`getSourceQualityFromItem` — heuristic)
> - `src/lib/content/actions.ts` (`addContentUrlAction` — create item với rawContent=null, then call enrich)
> - `src/lib/content/analysis-actions.ts` (`runContentAnalysisAction` — AI call site)
> - `src/lib/ai/client.ts` + `src/lib/ai/prompts/breakdown.ts` (`analyzeContentText`, `buildBreakdownUserPrompt`, `AnalysisProviderInput`)
> - `src/lib/ai/types.ts` (`AnalysisProviderInput`)
>
> **Linear issue:** [ALE-159](https://linear.app/alexgpt/issue/ALE-159/m8-url-analysis-pipeline-using-best-available-source)
> **Branch:** `feat/ale-159-url-analysis-pipeline`

---

## Prompt (copy từ đây)

```
You are implementing ALE-159: M8 URL Analysis Pipeline — wire the social-importer module into the existing content enrichment + AI Breakdown pipeline.

READ FIRST (mandatory before any code):
- docs/social-url-importer-plan.md (sections 3–9)
- src/lib/content/enrich-url-content.ts (current enrichment logic)
- src/lib/content/social-importer/index.ts (registry, importSocialUrl)
- src/lib/content/social-importer/priority.ts (pickAnalysisInput)
- src/lib/content/social-importer/types.ts (SocialImportResult, SourceQuality)
- src/lib/content/social-importer/adapters/youtube.ts (YouTubeImporter.import — real metadata)
- src/lib/content/social-importer/adapters/base.ts (makeWarning, nowIso)
- src/app/(app)/breakdown/[contentItemId]/page.tsx (Breakdown page, enrichment + render)
- src/components/custom/breakdown/breakdown-view.tsx (BreakdownView props)
- src/components/custom/breakdown/source-quality-badge.tsx (badge component from ALE-158)
- src/lib/content/analysis-source-quality.ts (getSourceQualityFromItem heuristic)
- src/lib/content/actions.ts (addContentUrlAction creates item, then enriches)
- src/lib/content/analysis-actions.ts (runContentAnalysisAction — AI call site)
- src/lib/ai/client.ts (analyzeContentText — wraps provider)
- src/lib/ai/prompts/breakdown.ts (buildBreakdownUserPrompt)
- src/lib/ai/types.ts (AnalysisProviderInput)
- .cursorrules — repo conventions

GOAL OF THIS ISSUE
Production pipeline cho URL-only content items hiện tại:
1. User paste URL → `addContentUrlAction` tạo item với rawContent=null, sourceUrl={url}
2. Breakdown page see rawContent=null + sourceUrl → call `enrichContentItemFromUrl`
3. `enrichContentItemFromUrl` (current) call `fetchUrlEmbedMetadata` → oEmbed → buildEnrichedRawContent → save raw_content, title

Mục tiêu ALE-159: Bước 3 thay bằng:
1. Call `importSocialUrl(sourceUrl)` (from social-importer/index.ts)
2. Call `pickAnalysisInput(result, null)` (vì pasteText chưa có — user dán URL, chưa dán text)
3. If `quality` = `blocked` / `manual_required`: set `rawContent = ""` (empty — AI won't run), set `sourceQuality = quality`, save to DB
4. If `quality` = `metadata_only` / `caption` / `transcript` / `paste_text`: build `rawContent` from `analysisInput` (title + content + warnings encoding), save to DB
5. Breakdown page nhận `sourceQuality` từ enrichment → truyền xuống `BreakdownView` → `SourceQualityBadge` render đúng màu/label
6. Analysis action (`runContentAnalysisAction`) nhận item với `rawContent` đã là tốt nhất → gọi AI như cũ, hoặc block sớm nếu `blocked`/`manual_required`

OUT OF SCOPE
- TikTok/Instagram real fetch → ALE-156/157 (still blocked)
- Real YouTube transcript → ALE-155 seam vẫn disabled
- DB migration for `source_quality` column → deferred
- Source quality badge UI polish → ALE-158 (already done, use as-is)
- Remix pipeline → ALE-148 (unaffected)
- Voice analysis pipeline → unchanged

HARD CONSTRAINTS
1. Preserve existing Paste text flow: when user dán text, `addContentTextAction` creates item with rawContent, platform=other, sourceUrl=null → analysis uses that rawContent, no enrichment
2. Preserve existing URL preview / thumbnail: still use `fetchUrlEmbedMetadata` + `resolveThumbnailUrl` (or call it from within YouTubeImporter which already does)
3. ALE-153 non-Vietnamese guard stays active: AI call still goes through `analyzeContentText` → `assertBreakdownNoNonVietnamese`
4. ALE-148 Remix CJK guard unaffected
5. No new npm deps
6. No DB migration — encode `sourceQuality` into `rawContent` text if needed

DELIVERABLES

### Commit 1 — Rewire `enrichContentItemFromUrl` to use `importSocialUrl`

Modify `src/lib/content/enrich-url-content.ts`:

1. Import `importSocialUrl` from `@/lib/content/social-importer`
2. Import `pickAnalysisInput` from `@/lib/content/social-importer/priority`
3. Import `getSourceQualityFromItem` from `@/lib/content/analysis-source-quality` (for backward-compat heuristic if needed)
4. Update `enrichContentItemFromUrl` return type:
   ```ts
   export async function enrichContentItemFromUrl(
     supabase: SupabaseClient<Database>,
     contentItemId: string,
   ): Promise<{
     item: ContentItemDetail | null;
     enriched: boolean;
     error: string | null;
     sourceQuality?: SourceQuality | null; // ← NEW
   }>
   ```
5. Replace the existing enrichment logic:

   ```ts
   // OLD:
   // const meta = await fetchUrlEmbedMetadata(sourceUrl);
   // if (!meta) return { item, enriched: false, error: null };
   // const rawContent = buildEnrichedRawContent(meta, sourceUrl);
   // const nextTitle = meta.title?.length > 0 ? meta.title.slice(0,200) : item.title;

   // NEW:
   const importResult = await importSocialUrl(sourceUrl);
   const { input: analysisInput, quality, warnings } = pickAnalysisInput(importResult, null);

   if (!analysisInput) {
     // Blocked / manual_required — save empty rawContent so analysis won't run
     const nextTitle = importResult.title?.trim()?.slice(0, 200) || item.title;
     const rawContent = ""; // empty → analysis action will see this and return manual CTA

     const { error: updateError } = await supabase
       .from("content_items")
       .update({ raw_content: rawContent, title: nextTitle })
       .eq("id", contentItemId);

     // ... reload item ...
     return { item: updated, enriched: true, error: null, sourceQuality: quality };
   }

   // Has analysisInput → build enriched rawContent from best input
   const nextTitle = importResult.title?.trim()?.slice(0, 200) || item.title;
   const author = importResult.author?.trim() || null;

   // Build rawContent text including metadata context + warnings encoding
   // Use the same marker format as buildEnrichedRawContent so getSourceQualityFromItem still recognizes it
   const parts: string[] = [
     "[Metadata tự động từ link — không phải transcript/caption đầy đủ. Để phân tích sâu hơn, hãy dán caption/script qua Paste text.]",
     "",
   ];
   if (importResult.title) parts.push(`Tiêu đề: ${importResult.title}`);
   if (importResult.author) parts.push(`Kênh/tác giả: ${importResult.author}`);
   parts.push("", "Bản dịch / nội dung có thể phân tích:", "", analysisInput);
   if (warnings.length > 0) {
     parts.push("", "[Cảnh báo đi kèm:]");
     for (const w of warnings) parts.push(`- ${w.code}: ${w.message}`);
   }
   const rawContent = parts.join("\n").trim();

   // Save to DB
   const { error: updateError } = await supabase
     .from("content_items")
     .update({ raw_content: rawContent, title: nextTitle })
     .eq("id", contentItemId);
   ```

   Note: preserve the `[Metadata tự động từ link` marker at the top so `getSourceQualityFromItem` in ALE-158 still maps to `metadata_only` (or `caption`/`transcript` when those exist in the future). This is backward-compatible.

6. For the `!analysisInput` path, the `rawContent` is empty → `runContentAnalysisAction` currently returns `"Content này chỉ có URL..."`. We'll improve that message in Commit 3.

7. The `sourceQuality` is returned transiently from `enrichContentItemFromUrl` to the Breakdown page, so the badge can show the correct value on first load.

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-159): rewire enrichContentItemFromUrl to use importSocialUrl + pickAnalysisInput`

### Commit 2 — Pass `sourceQuality` through to BreakdownView + SourceQualityBadge

1. **Modify `src/lib/content/enrich-url-content.ts`** return type: add `sourceQuality?: SourceQuality | null`
2. **Modify `src/app/(app)/breakdown/[contentItemId]/page.tsx`:**
   ```ts
   import { type SourceQuality } from "@/lib/content/social-importer/types";

   // After enrichment:
   const { item, enriched, error: enrichErrorFromCall, sourceQuality } = await enrichContentItemFromUrl(...);

   // Pass sourceQuality to BreakdownView
   return (
     <BreakdownView
       item={item}
       analysis={analysis}
       canAnalyze={Boolean(item.rawContent?.trim())}
       thumbnailUrl={thumbnailUrl}
       fetchError={fetchError}
       sourceQuality={sourceQuality ?? "paste_text"} // fallback for paste-text items (no enrichment)
     />
   );
   ```
3. **Modify `BreakdownView` props** in `breakdown-view.tsx`:
   ```ts
   type BreakdownViewProps = {
     // ... existing props ...
     sourceQuality: SourceQuality; // NEW — required, passed from page
   };
   ```
4. **Replace `getSourceQualityFromItem(item)` call with `props.sourceQuality`** inside `BreakdownView`:
   Currently ALE-158 computes quality from item inside BreakdownView (or inside the component). After rewire, `BreakdownView` should use the prop `sourceQuality` (truth from importer) instead of re-computing via heuristic.
   If ALE-158 currently calls `getSourceQualityFromItem(item)` inside BreakdownView, change it to use `props.sourceQuality`.
5. **ContentItemCard** on board-detail page: keep using `getSourceQualityFromItem(item)` (the heuristic maps correctly to the true state after the rewire, because rawContent encodes the marker). No change needed for the card.

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-159): pass sourceQuality from enrichment to BreakdownView for truthful badge`

### Commit 3 — Block AI for `blocked`/`manual_required` with specific CTA

Modify `src/lib/content/analysis-actions.ts`:

1. Import `getSourceQualityFromItem` from `@/lib/content/analysis-source-quality`
2. After getting `item` (line 33), compute:
   ```ts
   const sourceQuality = getSourceQualityFromItem(item);

   if (sourceQuality === "blocked" || sourceQuality === "manual_required") {
     return {
       success: false,
       error: "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text.",
     };
   }
   ```
3. Keep the existing `rawContent.length === 0` check as an additional fallthrough safety:
   ```ts
   const rawContent = item.rawContent?.trim() ?? "";
   if (rawContent.length === 0) {
     // If sourceQuality is blocked/manual_required, we already returned above.
     // If we reach here, it's a truly empty item (shouldn't happen unless DB corruption).
     return { success: false, error: "Content này chỉ có URL. Hãy thêm nội dung thủ công." };
   }
   ```
4. The rest of the function (AI call, saving analysis to DB) stays EXACTLY the same — no change.
   The `rawContent` now already contains the best `analysisInput` from `pickAnalysisInput`, so the AI receives the optimal text without any additional logic.

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-159): block AI analysis for blocked/manual_required with specific CTA`

### Commit 4 — AI prompt includes `sourceQuality` hint

1. **Modify `src/lib/ai/types.ts`** — add optional `sourceQuality` to `AnalysisProviderInput`:
   ```ts
   export type AnalysisProviderInput = {
     title: string;
     platform: string;
     rawContent: string;
     sourceUrl?: string | null;
     vietnameseOnlyRepair?: boolean;
     sourceQuality?: "transcript" | "caption" | "paste_text" | "metadata_only" | null; // ← NEW
   };
   ```
2. **Modify `src/lib/ai/prompts/breakdown.ts`** — `buildBreakdownUserPrompt`:
   ```ts
   export function buildBreakdownUserPrompt(input: {
     title: string;
     platform: string;
     rawContent: string;
     sourceUrl?: string | null;
     vietnameseOnlyRepair?: boolean;
     sourceQuality?: "transcript" | "caption" | "paste_text" | "metadata_only" | null;
   }): string {
     const qualityLine = input.sourceQuality
       ? `Nguồn dữ liệu phân tích: ${getSourceQualityLabel(input.sourceQuality)}. Lưu ý: ${getSourceQualityDescription(input.sourceQuality) ?? ""}`
       : null;

     const base = [
       `Tiêu đề: ${input.title}`,
       `Nền tảng: ${input.platform}`,
       input.sourceUrl ? `Link nguồn: ${input.sourceUrl}` : null,
       qualityLine,
       "",
       "Nội dung cần phân tích:",
       input.rawContent,
     ]
       .filter((line) => line !== null)
       .join("\n");
   ```
   Import `getSourceQualityLabel` and `getSourceQualityDescription` from `@/lib/content/analysis-source-quality`.

   Note: `getSourceQualityLabel` is a helper from ALE-158 (pure function, no React). If adding the import creates a circular dependency, inline a small switch statement in `breakdown.ts` instead. But since `analysis-source-quality.ts` is pure TS, it should be safe.

3. **Modify `src/lib/ai/client.ts`** — `analyzeContentText` signature:
   ```ts
   export async function analyzeContentText(input: {
     title: string;
     platform: string;
     rawContent: string;
     sourceUrl?: string | null;
     sourceQuality?: "transcript" | "caption" | "paste_text" | "metadata_only" | null; // ← NEW
   }): Promise<BreakdownAnalysisResult> { ... }
   ```
   Pass `sourceQuality` through to `analyzeContentTextOnce` → `AnalysisProviderInput`.

4. **Modify `src/lib/content/analysis-actions.ts`** — in `runContentAnalysisAction`, compute `sourceQuality` and pass to `analyzeContentText`:
   ```ts
   const sourceQuality = getSourceQualityFromItem(item);
   // ... (before AI call)
   const providerResult = await analyzeContentText({
     title: item.title,
     platform: getPlatformLabel(item.platform),
     rawContent,
     sourceUrl: item.sourceUrl,
     sourceQuality, // ← NEW
   });
   ```

   Important: only pass `sourceQuality` when it's NOT `blocked`/`manual_required` (because we bailed out earlier). This is fine because `getSourceQualityFromItem` returns one of the 6 values, but the AI only needs the 4 valid ones.

Verification gate:
  - `npm run lint` clean
  - `npm run type-check` clean
  - `npm run build` succeeds

Commit message: `feat(ALE-159): add sourceQuality hint to AI breakdown prompt`

### Commit 5 — Wire AI prompt (test + docs)

1. Add a unit test `src/lib/ai/prompts/__tests__/breakdown.test.ts` that verifies:
   - `buildBreakdownUserPrompt` includes the quality line when `sourceQuality` is provided
   - `buildBreakdownUserPrompt` does NOT include the quality line when `sourceQuality` is null
   - The prompt still includes `[Metadata tự động từ link` when rawContent has that marker (backward compat)
   Use `node:test` + `node:assert/strict`.

2. JSDoc on `enrichContentItemFromUrl`, `runContentAnalysisAction`, `analyzeContentText`, `buildBreakdownUserPrompt`

3. No production code changes.

Commit message: `docs(ALE-159): JSDoc + tests for pipeline rewire`

AFTER EACH COMMIT
- `npm run lint && npm run type-check && npm run build`
- `node --import tsx --test src/lib/ai/prompts/__tests__/*.test.ts` (if added)
- Commit format: `<type>(ALE-159): <description>`

---

## PRODUCTION SMOKE CHECKLIST (do this before marking Done)

PASTE text flow:
- [ ] Dán text vào Paste tab → item created with rawContent, sourceUrl=null
- [ ] Breakdown page shows "Paste text" blue badge
- [ ] AI Breakdown generates normally
- [ ] Analysis sections render correctly

YouTube watch?v= URL:
- [ ] Add YouTube URL → item created rawContent=null
- [ ] Open Breakdown → enrichment fires → "Metadata only" orange badge + yellow callout
- [ ] AI runs with metadata → ok analysis (quality is lower than transcript but still useful)
- [ ] Thumbnail hiển thị hqdefault.jpg

YouTube Shorts URL:
- [ ] Add YouTube Shorts URL → same as watch?v= (metadata_only badge, AI runs)

TikTok URL-only:
- [ ] Add TikTok URL → item created rawContent=null
- [ ] Open Breakdown → enrichment → "Cần dán thủ công" red badge + red callout
- [ ] Bấm "Phân tích AI" → KHÔNG gọi AI, hiển thị: "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text."
- [ ] Board card shows "Cần dán thủ công" badge

Instagram URL-only:
- [ ] Same as TikTok (blocked → manual CTA, no AI)

Paste text on existing TikTok/Instagram blocked item:
- [ ] User quay lại board, Paste text vào item đã blocked
- [ ] RawContent updates → badge becomes "Paste text" blue
- [ ] AI Breakdown now works (khi bấm phân tích lại)

Remix regression:
- [ ] Remix 5 variants vẫn generate bình thường (không regression ALE-148)

Leakage guard regression:
- [ ] Breakdown không lẫn tiếng Bồ Đào Nha (ALE-153 still active)

DONE WHEN (definition of done)
- All 5 commits pushed to `feat/ale-159-url-analysis-pipeline`
- PR opened with smoke evidence (at least 6/9 checks from smoke list)
- `npm run lint + type-check + build` all pass
- Unit test for AI prompt sourceQuality line added
- No regression: Paste text, thumbnail preview, Remix, ALE-153 guard
- Docs/project-status.md updated if needed in PR branch
```

---

## Notes for the human running this in Cursor

1. **Branch:** `feat/ale-159-url-analysis-pipeline` (created from `main`, commit `25841c2`)
2. **The rewire is additive** — `fetchUrlEmbedMetadata` + `buildEnrichedRawContent` vẫn còn trong repo, nhưng `enrich-url-content.ts` không còn gọi chúng trực tiếp. Thay vào đó, `YouTubeImporter.import` bên trong `social-importer` gọi `fetchUrlEmbedMetadata` (delegate), và `pickAnalysisInput` chọn output.
3. **Key design trick:** `rawContent` cuối cùng vẫn có định dạng text giống `buildEnrichedRawContent` (marker `[Metadata tự động từ link` ở đầu) để `getSourceQualityFromItem` heuristic tiếp tục map đúng. Điều này có nghĩa ALE-158 badge không cần đổi code.
4. **No DB migration** — `sourceQuality` truyền transient từ `enrichContentItemFromUrl` → Breakdown page → badge. Nếu page reload, `getSourceQualityFromItem(item)` heuristic vẫn map đúng (vì `rawContent` vẫn giữ marker).
5. **Commit 3 (block AI)** rất quan trọng: đây là lần đầu tiên pipeline `blocked`/`manual_required` không còn cho AI chạy với dữ liệu null (hành vi tốt hơn rõ ràng). Trước rewire, `runContentAnalysisAction` chỉ return generic "Content này chỉ có URL". Sau rewire, return message rõ ràng "Không lấy được caption/transcript từ link này..."
6. **AI prompt hint** (Commit 4) giúp model biết nguồn dữ liệu — nhưng không bắt buộc phải hoàn thành để ALE-159 Done. Nếu Cursor gặp khó khăn, skip Commit 4 — nó là optional enhancement.
