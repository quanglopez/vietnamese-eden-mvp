# M8 — Social URL Importer architecture spec

**Issue:** [ALE-154](https://linear.app/alexgpt/issue/ALE-154/m8-social-url-importer-architecture-interface-sourcequality-enum)
**Project:** M8 — Social URL Importer
**Status:** Spec only. No feature code yet.
**Date:** 2026-06-01

---

## 1. Goal

User dán URL YouTube / TikTok / Instagram (hoặc platform khác) -> app cố gắng lấy metadata, thumbnail, caption/transcript nếu có thể -> AI Breakdown dùng nguồn tốt nhất hiện có, gắn source quality badge để user biết AI phân tích từ đâu.

Replace dần pipeline hiện tại ở `src/lib/content/url-metadata.ts` + `enrich-url-content.ts` mà **không phá Paste text flow**.

---

## 2. Non-goals

- **Không claim** lấy transcript mọi video. YouTube public captions không phải lúc nào cũng tải được; TikTok / Instagram không có official transcript field.
- **Không bypass** platform restrictions (login walls, anti-scraping, ToS).
- **Không phá** Paste text flow hiện tại (đây là happy path cho user có caption sẵn).
- **Không scrape** trái phép, không dùng unofficial wrapper / scraper bên thứ ba nếu chưa đánh giá rủi ro.
- **Không promise** real-time data (caption có thể expire; oEmbed có thể rate-limit).

---

## 3. Import result contract

Canonical shape — implement trong `src/lib/content/social-importer/types.ts` (file mới, đề xuất trong Commit 1).

```ts
type SourceQuality =
  | "paste_text"        // user-provided full text via Paste tab
  | "transcript"        // full caption text, ideally timestamped
  | "caption"           // short caption / description, not full
  | "metadata_only"     // only title + author + maybe short description
  | "blocked"           // platform refused; nothing to analyze
  | "manual_required";  // cannot fetch; user must paste manually

type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "unknown";

type SocialImportWarningCode =
  | "TRANSCRIPT_UNAVAILABLE"
  | "CAPTION_UNAVAILABLE"
  | "METADATA_ONLY"
  | "PLATFORM_BLOCKED"
  | "THUMBNAIL_UNAVAILABLE"
  | "LOGIN_REQUIRED"
  | "RATE_LIMITED"
  | "UNSUPPORTED_URL"
  | "NON_VIETNAMESE_DETECTED";  // populated post-AI (ALE-153) when validator trips

interface SocialImportWarning {
  code: SocialImportWarningCode;
  message: string;     // tieng Viet, user-readable
  severity: "info" | "warning" | "error";
}

interface SocialImportResult {
  platform: SocialPlatform;
  sourceUrl: string;
  canonicalUrl?: string;          // normalized URL, vd /shorts/ID -> watch?v=ID

  // Content fields — optional because not every platform exposes all
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  captionText?: string;           // TikTok video_description, IG caption, YouTube short desc
  transcriptText?: string;        // full transcript if fetched
  metadataText?: string;          // compacted: title + author + description

  // Caller convenience
  analysisInput?: string;         // highest-priority text the AI Breakdown will consume
  sourceQuality: SourceQuality;
  warnings: SocialImportWarning[];

  // Audit
  fetchedAt: string;              // ISO 8601
}
```

### Quy tắc output

- `sourceQuality` PHẢI chính xác — nếu không chắc, default về `metadata_only` và add warning `METADATA_ONLY`.
- `transcriptText` CHỈ set nếu thật sự lấy được full transcript. Không set nếu chỉ có caption/description.
- `canonicalUrl` set khi URL gốc được rewrite (vd `/shorts/ID` -> `watch?v=ID`).
- `warnings` PHẢI có ít nhất 1 entry khi `sourceQuality = blocked | manual_required`.

---

## 4. Source priority

`analysisInput` được build theo priority (cao -> thấp):

| Priority | Field | Điều kiện |
|---|---|---|
| 1 | `transcriptText` | `length >= 100` chars |
| 2 | `captionText` | `length >= 50` chars |
| 3 | `paste_text` (raw_content) | `length >= 50` chars |
| 4 | `metadataText` | `title` tồn tại |
| 5 | (none) | -> `sourceQuality = manual_required` |

Nếu KHÔNG có field nào đủ điều kiện, caller **không gọi AI**. UI hiển thị "Cần dán thủ công".

Implementation helper (đề xuất trong Commit 1):

```ts
function pickAnalysisInput(
  result: SocialImportResult,
  pasteText: string | null | undefined,
): { input: string | null; quality: SourceQuality; warnings: SocialImportWarning[] } {
  // ... pure function, no side effects
}
```

---

## 5. Adapter interface

```ts
interface SocialUrlImporter {
  canHandle(url: string): boolean;
  import(url: string): Promise<SocialImportResult>;
}
```

### Adapters (Commit 2 stubs, Commit 3+ wire into real logic)

| Class | canHandle | Notes |
|---|---|---|
| `YouTubeImporter` | `youtube.com` / `youtu.be` hosts | Delegate to existing `fetchUrlEmbedMetadata` + new transcript fetch (ALE-155) |
| `TikTokImporter` | `tiktok.com` / `vt.tiktok.com` / `vm.tiktok.com` | oEmbed best-effort; fallback `blocked` (ALE-156) |
| `InstagramImporter` | `instagram.com` | oEmbed best-effort; fallback `blocked` (ALE-157) |
| `FacebookImporter` | `facebook.com` / `fb.com` / `fb.watch` | Future scope (not in M8) — return `unsupported` stub |
| `LinkedInImporter` | `linkedin.com` | Future scope — `unsupported` stub |
| `UnknownUrlImporter` | fallback (always returns true) | Returns `sourceQuality = manual_required`, `warnings: [UNSUPPORTED_URL]` |

### Registry

```ts
// src/lib/content/social-importer/index.ts
const ADAPTERS: SocialUrlImporter[] = [
  new YouTubeImporter(),
  new TikTokImporter(),
  new InstagramImporter(),
  new FacebookImporter(),  // stub
  new LinkedInImporter(),  // stub
  new UnknownUrlImporter(),
];

export async function importSocialUrl(url: string): Promise<SocialImportResult> {
  for (const adapter of ADAPTERS) {
    if (adapter.canHandle(url)) {
      return adapter.import(url);
    }
  }
  // unreachable: UnknownUrlImporter is always last
  throw new Error("No adapter matched");
}
```

---

## 6. UI implications

### Source quality badge (ALE-158)

5 visible variants — implemented in `src/components/custom/breakdown/source-quality-badge.tsx`:

| `sourceQuality` | Label | Color | Sub-text |
|---|---|---|---|
| `transcript` | "Transcript đầy đủ" | green | (none) |
| `caption` | "Caption / description" | yellow | (none) |
| `paste_text` | "Paste text" | blue | (none) |
| `metadata_only` | "Metadata only" | orange | "Kết quả này dựa trên metadata/description, chưa phải transcript đầy đủ." |
| `blocked` | "Cần dán thủ công" | red | "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text." |
| `manual_required` | "Cần dán thủ công" | red | Same as `blocked` |

Badge renders both on Breakdown page header AND content card (where data is available).

### Warning list

`warnings[]` rendered as collapsible `<details>` under badge — shows code + message.

---

## 7. Storage implications

### Decision: **Option A — không migration ngay** (chỉ thêm data qua existing fields)

Rationale:
- `content_items` đã có `raw_content` (TEXT) + `title` + `source_url` + `platform`
- Có thể **encode** `sourceQuality` + `warnings` + import metadata vào `raw_content` dạng structured text (giống `buildEnrichedRawContent` hiện tại)
- Tránh migration rủi ro (rollback phức tạp, downtime)

**Cách implement:**

- Caller (Breakdown page / API) gọi `importSocialUrl(url)` -> nhận `SocialImportResult`
- Lưu vào `content_items.raw_content` qua `buildEnrichedRawContent(result, sourceUrl)` — extended version thêm `sourceQuality` line + warnings list
- `title` cập nhật nếu `result.title` available
- `sourceQuality` cũng có thể cache vào `metadata` JSON field nếu DB schema cho phép (xác nhận qua migration check — nếu không có, dùng raw_content encoding)

**Future (deferred to ALE-159 / M8 phase 2):** nếu cần query/filter theo `sourceQuality`, sẽ cần migration thêm columns. Tạo issue con lúc đó.

### Backward compat

- Code mới đọc `raw_content` -> nếu thiếu `sourceQuality` marker -> default `paste_text` (vì user đã paste text trước đó)
- Code mới trong `enrich-url-content.ts` -> sửa để gọi `importSocialUrl` thay vì `fetchUrlEmbedMetadata` trực tiếp. Logic save/update y nguyên.

---

## 8. Safety / quality gates

| Gate | Where | Action |
|---|---|---|
| **ALE-153 leakage** | Post-AI (ALE-159) | Apply `assertBreakdownNoNonVietnamese` validator; if trip -> add warning `NON_VIETNAMESE_DETECTED`, retry 1x, fail with user error |
| **Weak input** | Pre-AI (ALE-159) | Nếu `analysisInput` rỗng hoặc `sourceQuality` thuộc `blocked`/`manual_required` -> **không gọi AI**, show "Cần dán thủ công" |
| **No false transcript claim** | UI copy | Badge + warning copy LUÔN nói "metadata" khi `sourceQuality = metadata_only`. Không dùng từ "transcript" trừ khi `transcriptText` thật sự có |
| **No unsafe scrape** | Adapter | Mỗi adapter chỉ dùng official/approved API: YouTube oEmbed + (TBD) caption API, TikTok oEmbed, Instagram oEmbed. Không scrape HTML |
| **Rate limit respect** | Adapter | Catch 429 / IP-block -> return `warnings: [RATE_LIMITED]`, `sourceQuality: blocked` (không retry vô hạn) |

---

## 9. Implementation plan (4 commits)

### Commit 1 — Foundation (no behavior change)
- `src/lib/content/social-importer/types.ts` — TypeScript types từ Section 3
- `src/lib/content/social-importer/priority.ts` — `pickAnalysisInput()` helper từ Section 4
- `src/lib/content/social-importer/index.ts` — empty `importSocialUrl()` skeleton + ADAPTERS list (empty)
- `src/lib/content/social-importer/__tests__/priority.test.ts` — unit test cho `pickAnalysisInput`
- `npm run lint && type-check && build` pass
- **No call site change yet** — code mới chưa được gọi

### Commit 2 — Adapter stubs (no behavior change)
- `src/lib/content/social-importer/adapters/youtube.ts` — `YouTubeImporter` with `canHandle` true + `import()` returns `metadata_only` stub using existing `fetchUrlEmbedMetadata`
- `src/lib/content/social-importer/adapters/tiktok.ts` — `TikTokImporter` stub returning `blocked` (TikTok oEmbed unreliable; document)
- `src/lib/content/social-importer/adapters/instagram.ts` — `InstagramImporter` stub returning `blocked`
- `src/lib/content/social-importer/adapters/facebook.ts` — `FacebookImporter` stub returning `manual_required` with `UNSUPPORTED_URL`
- `src/lib/content/social-importer/adapters/linkedin.ts` — `LinkedInImporter` stub
- `src/lib/content/social-importer/adapters/unknown.ts` — `UnknownUrlImporter` fallback (always matches)
- Wire into `ADAPTERS` list
- Tests: each adapter canHandle on representative URL
- **Behavior change**: NONE — code mới chưa được gọi từ app

### Commit 3 — Wire into existing pipeline (behavior change)
- `src/lib/content/enrich-url-content.ts` — replace `fetchUrlEmbedMetadata` call với `importSocialUrl`
- Map `SocialImportResult` -> existing `UrlEmbedMetadata` interface (compat layer) hoặc update callers
- Verify existing smoke flow không regression: YouTube watch?v=, Shorts, TikTok fallback, Paste text
- `npm run lint && type-check && build` pass

### Commit 4 — Docs + tests
- Update `docs/known-limitations.md` nếu có behavior change visible
- Inline JSDoc trên public API
- No new feature code

---

## 10. Out of scope (deferred issues)

- ALE-155 — YouTube transcript best-effort
- ALE-156 — TikTok oEmbed real implementation (after oEmbed reliability study)
- ALE-157 — Instagram oEmbed real implementation
- ALE-158 — Source quality badge UI
- ALE-159 — URL Analysis Pipeline (uses this architecture)
- DB migration for `source_quality` column (create sub-issue if/when needed)

---

## 11. Acceptance criteria recap (from ALE-154)

- [ ] Co interface `importSocialUrl(url): Promise<SocialImportResult>`
- [ ] Output chuẩn hoá đúng shape Section 3
- [ ] `sourceQuality` enum 6 giá trị
- [ ] Không DB migration (Option A)
- [ ] Backward-compatible với `src/lib/content/url-metadata.ts` + `enrich-url-content.ts`
- [ ] `npm run lint` + `type-check` + `build` pass
- [ ] Commit 3 verify không regression YouTube watch?v=, Shorts, TikTok, Paste text

---

## Related

- ALE-152 (Done) — URL preview baseline
- ALE-153 (P1) — Non-Vietnamese leakage validator (prerequisite for M8 safety)
- ALE-155 (P1) — YouTube importer real impl
- ALE-156 (P2) — TikTok importer real impl
- ALE-157 (P2) — Instagram importer real impl
- ALE-158 (P1) — Source quality badges UI
- ALE-159 (P1) — URL analysis pipeline wire-up
