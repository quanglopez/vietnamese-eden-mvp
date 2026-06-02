import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialImportWarning,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

const OEMBED_TIMEOUT_MS = 8_000;
const MIN_CAPTION_LENGTH = 50;
const TIKTOK_OEMBED_BASE = "https://www.tiktok.com/oembed";

type TikTokOEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

/** Kết quả fetch oEmbed — inject trong test, không gọi network. */
export type TikTokOEmbedFetchResult =
  | {
      ok: true;
      title: string | null;
      author: string | null;
      thumbnailUrl: string | null;
    }
  | { ok: false; status?: number };

export type TikTokImporterDeps = {
  fetchOEmbed?: (sourceUrl: string) => Promise<TikTokOEmbedFetchResult>;
};

function buildTikTokOEmbedRequestUrl(sourceUrl: string): string {
  return `${TIKTOK_OEMBED_BASE}?url=${encodeURIComponent(sourceUrl)}`;
}

/** URL TikTok có path/query hợp lệ (không chỉ hostname). */
export function isValidTikTokContentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    const isTikTokHost =
      host === "tiktok.com" ||
      host.endsWith(".tiktok.com") ||
      host === "vm.tiktok.com";
    if (!isTikTokHost) {
      return false;
    }
    return parsed.pathname.length > 1 || parsed.search.length > 0;
  } catch {
    return false;
  }
}

async function defaultFetchOEmbed(sourceUrl: string): Promise<TikTokOEmbedFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);

  try {
    const response = await fetch(buildTikTokOEmbedRequestUrl(sourceUrl), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "VietnameseEden/1.0 (tiktok-oembed)",
      },
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as TikTokOEmbedResponse;
    return {
      ok: true,
      title: data.title?.trim() || null,
      author: data.author_name?.trim() || null,
      thumbnailUrl: data.thumbnail_url?.trim() || null,
    };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timeout);
  }
}

function buildMetadataText(title: string | null, author: string | null): string | undefined {
  const parts: string[] = [];
  if (title) {
    parts.push(`Tiêu đề: ${title}`);
  }
  if (author) {
    parts.push(`Kênh/tác giả: ${author}`);
  }
  return parts.length > 0 ? parts.join("\n\n") : undefined;
}

function blockedResult(
  sourceUrl: string,
  status?: number,
): SocialImportResult {
  const warnings: SocialImportWarning[] = [
    makeWarning(
      "PLATFORM_BLOCKED",
      "TikTok chặn oEmbed từ server này. Hãy dán caption/script bằng Paste text.",
      "warning",
    ),
  ];
  if (status === 429) {
    warnings.push(
      makeWarning(
        "RATE_LIMITED",
        "TikTok oEmbed bị giới hạn tần suất (429). Thử lại sau hoặc dán text thủ công.",
        "info",
      ),
    );
  }
  return {
    platform: "tiktok",
    sourceUrl,
    sourceQuality: "blocked",
    warnings,
    fetchedAt: nowIso(),
  };
}

function captionWarnings(thumbnailUrl: string | null): SocialImportWarning[] {
  const warnings: SocialImportWarning[] = [
    makeWarning(
      "CAPTION_UNAVAILABLE",
      "TikTok chỉ cung cấp caption/description, không có transcript đầy đủ.",
      "info",
    ),
  ];
  if (!thumbnailUrl) {
    warnings.push(
      makeWarning(
        "THUMBNAIL_UNAVAILABLE",
        "Không lấy được thumbnail từ TikTok oEmbed.",
        "info",
      ),
    );
  }
  return warnings;
}

function metadataOnlyWarnings(thumbnailUrl: string | null): SocialImportWarning[] {
  const warnings: SocialImportWarning[] = [
    makeWarning(
      "METADATA_ONLY",
      "Chỉ lấy được metadata — chưa có caption/transcript đầy đủ.",
      "info",
    ),
    makeWarning(
      "TRANSCRIPT_UNAVAILABLE",
      "TikTok không cung cấp transcript.",
      "info",
    ),
  ];
  if (!thumbnailUrl) {
    warnings.push(
      makeWarning(
        "THUMBNAIL_UNAVAILABLE",
        "Không lấy được thumbnail từ TikTok oEmbed.",
        "info",
      ),
    );
  }
  return warnings;
}

/**
 * TikTok — oEmbed best-effort (ALE-156). Không transcript, không scrape HTML.
 */
export class TikTokImporter implements SocialUrlImporter {
  private readonly fetchOEmbed: (sourceUrl: string) => Promise<TikTokOEmbedFetchResult>;

  constructor(deps: TikTokImporterDeps = {}) {
    this.fetchOEmbed = deps.fetchOEmbed ?? defaultFetchOEmbed;
  }

  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "tiktok";
  }

  async import(url: string): Promise<SocialImportResult> {
    if (!isValidTikTokContentUrl(url)) {
      return {
        platform: "tiktok",
        sourceUrl: url,
        sourceQuality: "manual_required",
        warnings: [
          makeWarning(
            "UNSUPPORTED_URL",
            "URL TikTok không hợp lệ — thiếu video hoặc định dạng không nhận diện được.",
            "warning",
          ),
        ],
        fetchedAt: nowIso(),
      };
    }

    const oembed = await this.fetchOEmbed(url);
    if (!oembed.ok) {
      return blockedResult(url, oembed.status);
    }

    const title = oembed.title;
    const author = oembed.author;
    const thumbnailUrl = oembed.thumbnailUrl;
    const captionCandidate = title?.trim() ?? "";
    const hasLongCaption = captionCandidate.length >= MIN_CAPTION_LENGTH;

    const metadataText = buildMetadataText(title, author);

    if (hasLongCaption) {
      return {
        platform: "tiktok",
        sourceUrl: url,
        title: title ?? undefined,
        author: author ?? undefined,
        thumbnailUrl: thumbnailUrl ?? undefined,
        captionText: captionCandidate,
        metadataText,
        sourceQuality: "caption",
        warnings: captionWarnings(thumbnailUrl),
        fetchedAt: nowIso(),
      };
    }

    return {
      platform: "tiktok",
      sourceUrl: url,
      title: title ?? undefined,
      author: author ?? undefined,
      thumbnailUrl: thumbnailUrl ?? undefined,
      metadataText,
      sourceQuality: "metadata_only",
      warnings: metadataOnlyWarnings(thumbnailUrl),
      fetchedAt: nowIso(),
    };
  }
}
