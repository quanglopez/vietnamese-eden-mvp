import type { PlatformType } from "@/types/content";

export type DetectedPlatform = {
  /** Giá trị lưu vào DB (enum platform_type) */
  platform: PlatformType;
  /** Nhãn hiển thị — có thể chi tiết hơn enum DB */
  label: string;
};

function normalizeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function detectPlatformFromUrl(url: string): DetectedPlatform {
  const hostname = normalizeHostname(url);
  if (!hostname) {
    return { platform: "other", label: "Website" };
  }

  if (hostname === "tiktok.com" || hostname.endsWith(".tiktok.com") || hostname === "vm.tiktok.com") {
    return { platform: "tiktok", label: "TikTok" };
  }

  if (
    hostname === "youtube.com" ||
    hostname.endsWith(".youtube.com") ||
    hostname === "youtu.be" ||
    hostname.endsWith(".youtu.be")
  ) {
    return { platform: "youtube", label: "YouTube" };
  }

  if (
    hostname === "facebook.com" ||
    hostname.endsWith(".facebook.com") ||
    hostname === "fb.com" ||
    hostname.endsWith(".fb.com") ||
    hostname === "fb.watch"
  ) {
    return { platform: "facebook", label: "Facebook" };
  }

  if (hostname === "instagram.com" || hostname.endsWith(".instagram.com")) {
    return { platform: "instagram", label: "Instagram" };
  }

  if (hostname === "linkedin.com" || hostname.endsWith(".linkedin.com")) {
      return { platform: "linkedin", label: "LinkedIn" };
    }

  if (
    hostname === "x.com" ||
    hostname.endsWith(".x.com") ||
    hostname === "twitter.com" ||
    hostname.endsWith(".twitter.com")
  ) {
    return { platform: "other", label: "X (Twitter)" };
  }

  return { platform: "other", label: "Website" };
}

export function generateTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    const segments = parsed.pathname.replace(/\/$/, "").split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    if (lastSegment) {
      const decoded = decodeURIComponent(lastSegment).replace(/[-_+]/g, " ");
      const snippet = decoded.slice(0, 80);
      return `${host} · ${snippet}`;
    }

    return host;
  } catch {
    return "Link đã lưu";
  }
}

export function normalizeSourceUrl(url: string): string {
  const trimmed = url.trim();
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}
