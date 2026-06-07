# ALE-197: TikTok/Instagram transcript via Apify

## Context

Both `TikTokImporter` and `InstagramImporter` currently rely on oEmbed, which fails in production — TikTok blocks server IPs and Instagram requires a Facebook access token. This ticket upgrades both adapters to fetch real caption/transcript data via Apify's REST API when `APIFY_API_TOKEN` is set, with zero behavior change when the env var is absent.

**No new npm packages. No DB migrations. Build must stay green.**

---

## Read these files first — in this order

1. `src/lib/content/social-importer/types.ts` — `SocialImportResult`, `SourceQuality`, `SocialImportWarning`, `SocialImportWarningCode`
2. `src/lib/content/social-importer/adapters/base.ts` — `makeWarning`, `nowIso`
3. `src/lib/content/social-importer/adapters/youtube-transcript.ts` — the env-gate pattern to replicate (`YOUTUBE_TRANSCRIPT_ENABLED`, disabled vs. real fetcher, factory function)
4. `src/lib/content/social-importer/adapters/tiktok.ts` — current implementation in full
5. `src/lib/content/social-importer/adapters/instagram.ts` — current implementation in full

Do not start writing code until you have read all five files.

---

## What to build

### Shared rules that apply to both adapters

- Gate everything on `process.env.APIFY_API_TOKEN`. If the var is not set (or is empty), behave **exactly** as today — call `defaultFetchOEmbed` and return the existing result. No other code path changes.
- Use plain `fetch` to call the Apify REST API. No new npm dependency.
- Apify actor runs are synchronous via the "Run actor synchronously and get dataset items" endpoint:
  ```
  POST https://api.apify.com/v2/acts/{actorId}/run-sync-get-dataset-items?token={APIFY_API_TOKEN}
  Content-Type: application/json
  Body: { "startUrls": [{ "url": "<sourceUrl>" }] }
  ```
- Set a hard timeout of **30 000 ms** on the Apify fetch (use `AbortController`).
- If the Apify call throws, times out, or returns a non-2xx status, **fall back silently to oEmbed** (do not surface an Apify-specific error to the caller).
- Map Apify result fields into `SocialImportResult` following the field conventions already used in the file (`title`, `author`, `thumbnailUrl`, `captionText`, `transcriptText`, `metadataText`, `sourceQuality`, `warnings`).
- Inject the Apify fetcher through the existing `deps` pattern (same as `fetchOEmbed`) so tests can mock it without network calls.
- Add a new `SocialImportWarningCode` value `"APIFY_FALLBACK"` to `types.ts` — used when Apify is configured but the call fails and oEmbed is used instead.

---

### TikTok — actor `apify/tiktok-scraper`

**File to modify:** `src/lib/content/social-importer/adapters/tiktok.ts`

Apify response items for TikTok look like:

```jsonc
{
  "id": "...",
  "text": "caption / description of the video",   // use as captionText
  "authorMeta": { "name": "...", "nickName": "..." },
  "videoMeta": { "duration": 60 },
  "webVideoUrl": "https://www.tiktok.com/...",
  "thumbnailUrl": "https://..."   // may also be "covers"[0]
}
```

Mapping rules:

- `transcriptText`: TikTok Scraper does **not** return a speech transcript. Leave as `undefined`.
- `captionText`: use `item.text` if non-empty (trim it). If `item.text` is missing/empty, fall back to oEmbed title logic already in the file.
- `sourceQuality`:
  - `"caption"` when `captionText` is set and `captionText.length >= MIN_CAPTION_LENGTH`
  - `"metadata_only"` otherwise
- `author`: prefer `item.authorMeta?.nickName ?? item.authorMeta?.name`
- `thumbnailUrl`: `item.thumbnailUrl ?? item.covers?.[0]`
- Keep all existing warning helper functions (`captionWarnings`, `metadataOnlyWarnings`, `blockedResult`) unchanged. Reuse them for the Apify path too.

New type additions inside `tiktok.ts`:

```ts
export type TikTokApifyFetchResult =
  | { ok: true; items: TikTokApifyItem[] }
  | { ok: false; status?: number };

export type TikTokImporterDeps = {
  fetchOEmbed?: (sourceUrl: string) => Promise<TikTokOEmbedFetchResult>;
  fetchApify?: (sourceUrl: string) => Promise<TikTokApifyFetchResult>;
};
```

Logic flow in `TikTokImporter.import()`:

1. Validate URL (existing `isValidTikTokContentUrl` check — unchanged).
2. If `APIFY_API_TOKEN` is set:
  a. Call `fetchApify(url)`.
   b. If result is `ok: true` and `items[0]` exists → map to `SocialImportResult` and return.
   c. Otherwise (ok: false or empty items) → add `APIFY_FALLBACK` warning, fall through to oEmbed.
3. Call `fetchOEmbed(url)` (existing logic, unchanged).

---

### Instagram — actor `apify/instagram-scraper`

**File to modify:** `src/lib/content/social-importer/adapters/instagram.ts`

Apify response items for Instagram look like:

```jsonc
{
  "id": "...",
  "type": "Image" | "Video" | "Sidecar",
  "caption": "post caption text",               // use as captionText
  "ownerUsername": "...",
  "displayUrl": "https://...",                  // use as thumbnailUrl
  "videoUrl": "https://...",                    // present for Video type
  "url": "https://www.instagram.com/p/..."
}
```

Mapping rules:

- `transcriptText`: Instagram Scraper does **not** return speech transcripts. Leave as `undefined`.
- `captionText`: use `item.caption` if non-empty (trim it).
- `sourceQuality`:
  - `"caption"` when `captionText` is set and `captionText.length >= MIN_CAPTION_LENGTH`
  - `"metadata_only"` otherwise
- `author`: `item.ownerUsername`
- `thumbnailUrl`: `item.displayUrl`
- Reuse existing `captionWarnings`, `metadataOnlyWarnings`, `blockedResult` helpers unchanged.

New type additions inside `instagram.ts`:

```ts
export type InstagramApifyFetchResult =
  | { ok: true; items: InstagramApifyItem[] }
  | { ok: false; status?: number };

export type InstagramImporterDeps = {
  fetchOEmbed?: (sourceUrl: string) => Promise<InstagramOEmbedFetchResult>;
  fetchApify?: (sourceUrl: string) => Promise<InstagramApifyFetchResult>;
};
```

Logic flow in `InstagramImporter.import()` — same pattern as TikTok:

1. Validate URL (existing `isValidInstagramContentUrl` — unchanged).
2. If `APIFY_API_TOKEN` is set:
  a. Call `fetchApify(url)`.
   b. If `ok: true` and `items[0]` exists → map and return.
   c. Otherwise → add `APIFY_FALLBACK` warning, fall through to oEmbed.
3. Call `fetchOEmbed(url)` (existing logic, unchanged).

---

### types.ts change

Add `"APIFY_FALLBACK"` to the `SocialImportWarningCode` union:

```ts
export type SocialImportWarningCode =
  | "TRANSCRIPT_UNAVAILABLE"
  | "CAPTION_UNAVAILABLE"
  | "METADATA_ONLY"
  | "PLATFORM_BLOCKED"
  | "THUMBNAIL_UNAVAILABLE"
  | "LOGIN_REQUIRED"
  | "RATE_LIMITED"
  | "UNSUPPORTED_URL"
  | "NON_VIETNAMESE_DETECTED"
  | "APIFY_FALLBACK";   // ← add this
```

This is the **only** change to `types.ts`.

---

### Default Apify fetch helper (implement inside each adapter file)

Each adapter gets its own `defaultFetchApify` function. Here is the canonical shape — adapt field names per platform:

```ts
const APIFY_ACTOR_ID = "apify~tiktok-scraper"; // or "apify~instagram-scraper"
const APIFY_TIMEOUT_MS = 30_000;

async function defaultFetchApify(sourceUrl: string): Promise<TikTokApifyFetchResult> {
  const token = process.env.APIFY_API_TOKEN;
  // Guard: caller already checks token, but be defensive
  if (!token) return { ok: false };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APIFY_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`,
      {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startUrls: [{ url: sourceUrl }] }),
      },
    );

    if (!response.ok) return { ok: false, status: response.status };

    const items = (await response.json()) as TikTokApifyItem[];
    return { ok: true, items: Array.isArray(items) ? items : [] };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}
```

Use `/` not `~` if Apify redirects — check Apify docs. The actor IDs are:

- TikTok: `apify~tiktok-scraper`
- Instagram: `apify~instagram-scraper`

---

## Hard constraints


| Constraint                         | Detail                                                                                                 |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------ |
| No behavior change without env var | When `APIFY_API_TOKEN` is unset, the diff must produce identical runtime behavior to today             |
| No new npm deps                    | Only `fetch` (already available in Next.js 14 runtime)                                                 |
| No DB migrations                   | `SocialImportResult` is never persisted directly; no schema changes                                    |
| Build must pass                    | Run `npx next build` after changes — zero new TypeScript errors                                        |
| Surgical edits only                | Do not reformat unmodified code, rename variables, or reorganize imports beyond what the task requires |
| Inject for testability             | `defaultFetchApify` must be injectable via `deps` so unit tests can mock it                            |


---

## Verification steps

Run these after implementation:

```bash
# 1. TypeScript must compile clean
npx tsc --noEmit

# 2. Full build must pass
npx next build

# 3. Manual smoke test (token not set — must behave as before)
APIFY_API_TOKEN= npx tsx -e "
import { TikTokImporter } from './src/lib/content/social-importer/adapters/tiktok';
const r = await new TikTokImporter().import('https://www.tiktok.com/@test/video/123');
console.log(r.sourceQuality); // expect 'blocked' (oEmbed path, no network)
"
```

If existing tests exist for `tiktok.ts` or `instagram.ts`, run them and confirm they still pass — the injected `fetchOEmbed` mock in those tests must still work unchanged.

---

## What success looks like

- `APIFY_API_TOKEN` not set → identical behavior to today, zero new warnings
- `APIFY_API_TOKEN` set, Apify returns data → `sourceQuality: "caption"` (or `"metadata_only"`) with `captionText` populated from Apify
- `APIFY_API_TOKEN` set, Apify call fails → `APIFY_FALLBACK` warning added, oEmbed path runs as fallback
- `npx next build` exits 0
- No new npm dependencies in `package.json`

