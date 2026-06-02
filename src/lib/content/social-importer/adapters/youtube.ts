import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import {
  buildEnrichedRawContent,
  extractYouTubeVideoId,
  fetchUrlEmbedMetadata,
  getYouTubeThumbnailUrl,
  normalizeYouTubeUrlForOEmbed,
  type UrlEmbedMetadata,
} from "@/lib/content/url-metadata";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import {
  createTranscriptFetcher,
  type TranscriptFetcher,
} from "@/lib/content/social-importer/adapters/youtube-transcript";
import type {
  SocialImportResult,
  SocialImportWarning,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

export type YouTubeImporterDeps = {
  fetchMetadata?: (url: string) => Promise<UrlEmbedMetadata | null>;
  transcriptFetcher?: TranscriptFetcher;
};

const MIN_TRANSCRIPT_LENGTH = 100;

function buildBaseWarnings(
  hasTranscript: boolean,
  thumbnailUrl: string | null,
): SocialImportWarning[] {
  const warnings: SocialImportWarning[] = [
    makeWarning(
      "METADATA_ONLY",
      "Chỉ lấy được metadata — chưa có transcript/caption đầy đủ.",
      "info",
    ),
  ];

  if (!hasTranscript) {
    warnings.push(
      makeWarning(
        "TRANSCRIPT_UNAVAILABLE",
        "Transcript/caption chính thức không khả dụng cho video này. Hãy dán script bằng Paste text nếu cần phân tích sâu.",
        "info",
      ),
    );
  }

  if (!thumbnailUrl) {
    warnings.push(
      makeWarning(
        "THUMBNAIL_UNAVAILABLE",
        "Không lấy được thumbnail từ video ID.",
        "info",
      ),
    );
  }

  return warnings;
}

/** Canonical watch URL khi có video ID; null nếu URL không parse được. */
export function resolveCanonicalYouTubeUrl(sourceUrl: string): string | null {
  const videoId = extractYouTubeVideoId(sourceUrl);
  if (!videoId) {
    return null;
  }
  return normalizeYouTubeUrlForOEmbed(sourceUrl);
}

/**
 * YouTube importer — metadata tier qua oEmbed/helpers hiện có (ALE-155).
 * Transcript thật: tắt mặc định (seam `TranscriptFetcher`).
 */
export class YouTubeImporter implements SocialUrlImporter {
  private readonly fetchMetadata: (url: string) => Promise<UrlEmbedMetadata | null>;
  private readonly transcriptFetcher: TranscriptFetcher;

  constructor(deps: YouTubeImporterDeps = {}) {
    this.fetchMetadata = deps.fetchMetadata ?? fetchUrlEmbedMetadata;
    this.transcriptFetcher =
      deps.transcriptFetcher ?? createTranscriptFetcher();
  }

  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "youtube";
  }

  async import(url: string): Promise<SocialImportResult> {
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return {
        platform: "youtube",
        sourceUrl: url,
        sourceQuality: "manual_required",
        warnings: [
          makeWarning(
            "UNSUPPORTED_URL",
            "URL YouTube không hợp lệ — không trích được video ID.",
            "warning",
          ),
          makeWarning(
            "TRANSCRIPT_UNAVAILABLE",
            "Không thể lấy transcript khi URL không hợp lệ.",
            "info",
          ),
        ],
        fetchedAt: nowIso(),
      };
    }

    const canonicalUrl = normalizeYouTubeUrlForOEmbed(url);
    const thumbnailFromId = getYouTubeThumbnailUrl(videoId);
    const embedMeta = await this.fetchMetadata(canonicalUrl);

    const meta: UrlEmbedMetadata = embedMeta ?? {
      title: null,
      author: null,
      description: null,
      thumbnailUrl: thumbnailFromId,
    };

    const thumbnailUrl =
      meta.thumbnailUrl?.trim() || thumbnailFromId || null;

    const rawTranscript = await this.transcriptFetcher.fetchTranscript(videoId);
    const transcriptText =
      rawTranscript && rawTranscript.trim().length >= MIN_TRANSCRIPT_LENGTH
        ? rawTranscript.trim()
        : undefined;

    const metadataText = buildEnrichedRawContent(meta, canonicalUrl);
    const analysisInput = metadataText;
    const hasTranscript = Boolean(transcriptText);

    return {
      platform: "youtube",
      sourceUrl: url,
      canonicalUrl,
      title: meta.title ?? undefined,
      author: meta.author ?? undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
      metadataText,
      analysisInput,
      transcriptText,
      sourceQuality: "metadata_only",
      warnings: buildBaseWarnings(hasTranscript, thumbnailUrl),
      fetchedAt: nowIso(),
    };
  }
}
