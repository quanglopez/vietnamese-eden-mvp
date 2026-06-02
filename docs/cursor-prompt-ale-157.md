# ALE-157 — Instagram Metadata Importer (oEmbed fallback)

**Branch:** `feat/ale-157-instagram-oembed`  
**Pattern:** Same as ALE-156 (TikTok) — `api.instagram.com/oembed`, 8s timeout, DI for tests.

## Mapping

| Condition | `sourceQuality` |
|-----------|-----------------|
| oEmbed OK, title ≥ 50 | `caption` |
| oEmbed OK, short title | `metadata_only` |
| oEmbed fail | `blocked` (+ `LOGIN_REQUIRED`, `PLATFORM_BLOCKED`) |
| Invalid URL | `manual_required` |

Never set `transcriptText`. No scrape, no new deps, no DB migration.
