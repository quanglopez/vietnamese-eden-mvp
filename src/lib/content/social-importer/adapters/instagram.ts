import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialImportWarning,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

const OEMBED_TIMEOUT_MS = 8_000;
const APIFY_TIMEOUT_MS = 30_000;
const MIN_CAPTION_LENGTH = 50;
const INSTAGRAM_OEMBED_BASE = "https://api.instagram.com/oembed";
const APIFY_ACTOR_ID = "apify~instagram-scraper";

type InstagramOEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

export type InstagramApifyItem = {
  id?: string;
  type?: "Image" | "Video" | "Sidecar" | string;
  caption?: string;
  ownerUsername?: string;
  displayUrl?: string;
  videoUrl?: string;
  url?: string;
};

/** Kết quả fetch oEmbed — inject trong test, không gọi network. */
export type InstagramOEmbedFetchResult =
  | {
      ok: true;
      title: string | null;
      author: string | null;
      thumbnailUrl: string | null;
    }
  | { ok: false; status?: number };

export type InstagramApifyFetchResult =
  | { ok: true; items: InstagramApifyItem[] }
  | { ok: false; status?: number };

export type InstagramImporterDeps = {
  fetchOEmbed?: (sourceUrl: string) => Promise<InstagramOEmbedFetchResult>;
  fetchApify?: (sourceUrl: string) => Promise<InstagramApifyFetchResult>;
};

function isApifyEnabled(): boolean {
  return Boolean(process.env.APIFY_API_TOKEN?.trim());
}

function buildInstagramOEmbedRequestUrl(sourceUrl: string): string {
  const token = process.env.INSTAGRAM_OEMBED_TOKEN;
  const params = new URLSearchParams({ url: sourceUrl });
  if (token) params.set("access_token", token);
  return `${INSTAGRAM_OEMBED_BASE}?${params.toString()}`;
}

/** URL Instagram trỏ tới post/reel/TV (không chỉ homepage). */
export function isValidInstagramContentUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
    if (host !== "instagram.com" && !host.endsWith(".instagram.com")) {
      return false;
    }
    const path = parsed.pathname.toLowerCase();
    return (
      path.startsWith("/p/") ||
      path.startsWith("/reel/") ||
      path.includes("/reel/") ||
      path.startsWith("/tv/")
    );
  } catch {
    return false;
  }
}

async function defaultFetchOEmbed(
  sourceUrl: string,
): Promise<InstagramOEmbedFetchResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OEMBED_TIMEOUT_MS);

  try {
    const response = await fetch(buildInstagramOEmbedRequestUrl(sourceUrl), {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "VietnameseEden/1.0 (instagram-oembed)",
      },
    });

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const data = (await response.json()) as InstagramOEmbedResponse;
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

async function defaultFetchApify(sourceUrl: string): Promise<InstagramApifyFetchResult> {
  const token = process.env.APIFY_API_TOKEN?.trim();
  if (!token) {
    return { ok: false };
  }

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

    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const items = (await response.json()) as InstagramApifyItem[];
    return { ok: true, items: Array.isArray(items) ? items : [] };
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

function apifyFallbackWarning(): SocialImportWarning {
  return makeWarning(
    "APIFY_FALLBACK",
    "Không lấy được dữ liệu từ Apify — đang dùng oEmbed dự phòng.",
    "info",
  );
}

function withOptionalWarning(
  result: SocialImportResult,
  warning: SocialImportWarning | null,
): SocialImportResult {
  if (!warning) {
    return result;
  }
  return {
    ...result,
    warnings: [warning, ...result.warnings],
  };
}

function mapApifyItemToResult(item: InstagramApifyItem, sourceUrl: string): SocialImportResult {
  const author = item.ownerUsername?.trim() || undefined;
  const thumbnailUrl = item.displayUrl?.trim() || undefined;
  const captionCandidate = item.caption?.trim() ?? "";
  const hasLongCaption = captionCandidate.length >= MIN_CAPTION_LENGTH;
  const title = captionCandidate || undefined;
  const metadataText = buildMetadataText(title ?? null, author ?? null);

  if (hasLongCaption) {
    return {
      platform: "instagram",
      sourceUrl,
      canonicalUrl: item.url?.trim() || undefined,
      title,
      author,
      thumbnailUrl,
      captionText: captionCandidate,
      metadataText,
      sourceQuality: "caption",
      warnings: captionWarnings(thumbnailUrl ?? null),
      fetchedAt: nowIso(),
    };
  }

  return {
    platform: "instagram",
    sourceUrl,
    canonicalUrl: item.url?.trim() || undefined,
    title,
    author,
    thumbnailUrl,
    metadataText,
    sourceQuality: "metadata_only",
    warnings: metadataOnlyWarnings(thumbnailUrl ?? null),
    fetchedAt: nowIso(),
  };
}

function blockedResult(sourceUrl: string, status?: number): SocialImportResult {
  const warnings: SocialImportWarning[] = [
    makeWarning(
      "LOGIN_REQUIRED",
      "Instagram oEmbed yêu cầu đăng nhập hoặc từ chối truy cập từ server — hãy dán caption bằng Paste text.",
      "warning",
    ),
    makeWarning(
      "PLATFORM_BLOCKED",
      "Không lấy được metadata Instagram từ link này (không scrape HTML).",
      "info",
    ),
  ];
  if (status === 429) {
    warnings.push(
      makeWarning(
        "RATE_LIMITED",
        "Instagram oEmbed bị giới hạn tần suất (429). Thử lại sau hoặc dán text thủ công.",
        "info",
      ),
    );
  }
  return {
    platform: "instagram",
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
      "Instagram chỉ cung cấp caption/description qua oEmbed, không có transcript đầy đủ.",
      "info",
    ),
  ];
  if (!thumbnailUrl) {
    warnings.push(
      makeWarning(
        "THUMBNAIL_UNAVAILABLE",
        "Không lấy được thumbnail từ Instagram oEmbed.",
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
      "Instagram không cung cấp transcript qua oEmbed.",
      "info",
    ),
  ];
  if (!thumbnailUrl) {
    warnings.push(
      makeWarning(
        "THUMBNAIL_UNAVAILABLE",
        "Không lấy được thumbnail từ Instagram oEmbed.",
        "info",
      ),
    );
  }
  return warnings;
}

function buildFromOEmbed(
  url: string,
  oembed: Extract<InstagramOEmbedFetchResult, { ok: true }>,
): SocialImportResult {
  const title = oembed.title;
  const author = oembed.author;
  const thumbnailUrl = oembed.thumbnailUrl;
  const captionCandidate = title?.trim() ?? "";
  const hasLongCaption = captionCandidate.length >= MIN_CAPTION_LENGTH;
  const metadataText = buildMetadataText(title, author);

  if (hasLongCaption) {
    return {
      platform: "instagram",
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
    platform: "instagram",
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

/**
 * Instagram — oEmbed best-effort (ALE-157). Apify caption khi APIFY_API_TOKEN có (ALE-197).
 */
export class InstagramImporter implements SocialUrlImporter {
  private readonly fetchOEmbed: (
    sourceUrl: string,
  ) => Promise<InstagramOEmbedFetchResult>;
  private readonly fetchApify: (sourceUrl: string) => Promise<InstagramApifyFetchResult>;

  constructor(deps: InstagramImporterDeps = {}) {
    this.fetchOEmbed = deps.fetchOEmbed ?? defaultFetchOEmbed;
    this.fetchApify = deps.fetchApify ?? defaultFetchApify;
  }

  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "instagram";
  }

  async import(url: string): Promise<SocialImportResult> {
    if (!isValidInstagramContentUrl(url)) {
      return {
        platform: "instagram",
        sourceUrl: url,
        sourceQuality: "manual_required",
        warnings: [
          makeWarning(
            "UNSUPPORTED_URL",
            "URL Instagram không hợp lệ — cần link post/reel/TV.",
            "warning",
          ),
        ],
        fetchedAt: nowIso(),
      };
    }

    let apifyFallback: SocialImportWarning | null = null;

    if (isApifyEnabled()) {
      const apify = await this.fetchApify(url);
      const firstItem = apify.ok ? apify.items[0] : undefined;
      if (apify.ok && firstItem) {
        return mapApifyItemToResult(firstItem, url);
      }
      apifyFallback = apifyFallbackWarning();
    }

    const oembed = await this.fetchOEmbed(url);
    if (!oembed.ok) {
      return withOptionalWarning(blockedResult(url, oembed.status), apifyFallback);
    }

    return withOptionalWarning(buildFromOEmbed(url, oembed), apifyFallback);
  }
}
