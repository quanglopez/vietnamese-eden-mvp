import type { PlatformType } from "@/types/content";

export const PLATFORM_GRADIENTS: Record<PlatformType, string> = {
  tiktok: "from-[#ff0050] to-[#00f2ea]",
  instagram: "from-[#f7931e] to-[#e84393]",
  youtube: "from-[#ff0000] to-[#ff6b35]",
  facebook: "from-[#1877f2] to-[#6c5ce7]",
  other: "from-brand to-brand-3",
};

export const PLATFORM_LABELS: Record<PlatformType, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  other: "Khác",
};

export function getPlatformGradient(platform: PlatformType): string {
  return PLATFORM_GRADIENTS[platform] ?? PLATFORM_GRADIENTS.other;
}

export function getPlatformLabel(platform: PlatformType): string {
  return PLATFORM_LABELS[platform] ?? PLATFORM_LABELS.other;
}

export function getContentPreview(
  title: string,
  rawContent: string | null,
  maxLength = 120,
): string {
  const source = rawContent?.trim() || title.trim();
  if (source.length <= maxLength) {
    return source;
  }
  return `${source.slice(0, maxLength).trim()}…`;
}
