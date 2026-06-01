import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import type { PlatformType } from "@/types/content";

export type UrlEmbedMetadata = {
  title: string | null;
  author: string | null;
  description: string | null;
  thumbnailUrl: string | null;
};

const OEMBED_FETCH_MS = 8_000;

export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      const id = parsed.pathname.replace(/^\//, "").split("/")[0];
      return id || null;
    }

    if (host === "youtube.com" || host.endsWith(".youtube.com")) {
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] ?? null;
      }
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/** Thumbnail without network — YouTube only. */
export function getLinkThumbnailUrl(
  sourceUrl: string | null | undefined,
  platform: PlatformType,
): string | null {
  if (!sourceUrl?.trim()) {
    return null;
  }

  const youtubeId = extractYouTubeVideoId(sourceUrl);
  if (youtubeId) {
    return getYouTubeThumbnailUrl(youtubeId);
  }

  if (platform === "youtube") {
    const id = extractYouTubeVideoId(sourceUrl);
    return id ? getYouTubeThumbnailUrl(id) : null;
  }

  return null;
}

function getOEmbedEndpoint(sourceUrl: string): string | null {
  const { platform, label } = detectPlatformFromUrl(sourceUrl);
  const encoded = encodeURIComponent(sourceUrl);

  if (platform === "youtube" || label === "YouTube") {
    return `https://www.youtube.com/oembed?url=${encoded}&format=json`;
  }
  if (platform === "tiktok" || label === "TikTok") {
    return `https://www.tiktok.com/oembed?url=${encoded}`;
  }
  return null;
}

type OEmbedResponse = {
  title?: string;
  author_name?: string;
  thumbnail_url?: string;
};

export async function fetchUrlEmbedMetadata(
  sourceUrl: string,
): Promise<UrlEmbedMetadata | null> {
  const endpoint = getOEmbedEndpoint(sourceUrl);
  if (!endpoint) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OEMBED_FETCH_MS);

  try {
    const response = await fetch(endpoint, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "User-Agent": "VietnameseEden/1.0 (url-metadata)",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as OEmbedResponse;
    const youtubeId = extractYouTubeVideoId(sourceUrl);

    return {
      title: data.title?.trim() || null,
      author: data.author_name?.trim() || null,
      description: null,
      thumbnailUrl:
        data.thumbnail_url?.trim() ||
        (youtubeId ? getYouTubeThumbnailUrl(youtubeId) : null),
    };
  } catch {
    const youtubeId = extractYouTubeVideoId(sourceUrl);
    if (youtubeId) {
      return {
        title: null,
        author: null,
        description: null,
        thumbnailUrl: getYouTubeThumbnailUrl(youtubeId),
      };
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export function buildEnrichedRawContent(
  meta: UrlEmbedMetadata,
  sourceUrl: string,
): string {
  const lines = [
    "[Metadata tự động từ link — không phải transcript/caption đầy đủ. Để phân tích sâu hơn, hãy dán caption/script qua Paste text.]",
    "",
  ];

  if (meta.title) {
    lines.push(`Tiêu đề: ${meta.title}`);
  }
  if (meta.author) {
    lines.push(`Kênh/tác giả: ${meta.author}`);
  }
  if (meta.description) {
    lines.push(`Mô tả: ${meta.description}`);
  }

  lines.push("", `Link gốc: ${sourceUrl}`);

  return lines.join("\n").trim();
}

export function resolveThumbnailUrl(
  sourceUrl: string | null | undefined,
  platform: PlatformType,
  embedMeta: UrlEmbedMetadata | null,
): string | null {
  if (embedMeta?.thumbnailUrl) {
    return embedMeta.thumbnailUrl;
  }
  return getLinkThumbnailUrl(sourceUrl, platform);
}
