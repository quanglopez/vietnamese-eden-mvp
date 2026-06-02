import type { SourceQuality } from "@/lib/content/social-importer/types";
import type { BoardContentItem } from "@/types/content";
import type { ContentItemDetail } from "@/types/analysis";

export type { SourceQuality };

/** Marker trong `rawContent` do `buildEnrichedRawContent` ghi (url-metadata.ts). */
export const METADATA_AUTO_MARKER = "[Metadata tự động từ link";

const MIN_PASTE_TEXT_LENGTH = 100;

export type SourceQualityItemFields = Pick<
  BoardContentItem | ContentItemDetail,
  "rawContent" | "sourceUrl" | "platform"
>;

/**
 * Suy ra `SourceQuality` từ model hiện tại (chưa có cột DB).
 * ALE-159 sẽ thay bằng đọc trực tiếp `content_items.source_quality`.
 */
export function getSourceQualityFromItem(
  item: SourceQualityItemFields,
): SourceQuality {
  const raw = item.rawContent?.trim() ?? "";
  const hasUrl = Boolean(item.sourceUrl?.trim());
  const hasMetadataMarker = raw.includes(METADATA_AUTO_MARKER);

  if (raw.length >= MIN_PASTE_TEXT_LENGTH && (!hasUrl || !hasMetadataMarker)) {
    return "paste_text";
  }

  if (
    hasUrl &&
    (item.platform === "tiktok" || item.platform === "instagram") &&
    raw.length === 0
  ) {
    return "blocked";
  }

  if (hasUrl && (hasMetadataMarker || raw.length === 0)) {
    return "metadata_only";
  }

  if (!hasUrl && raw.length === 0) {
    return "manual_required";
  }

  return "manual_required";
}

/** Nhãn badge tiếng Việt (spec M8 section 6). */
export function getSourceQualityLabel(quality: SourceQuality): string {
  switch (quality) {
    case "transcript":
      return "Transcript đầy đủ";
    case "caption":
      return "Caption / description";
    case "paste_text":
      return "Paste text";
    case "metadata_only":
      return "Metadata only";
    case "blocked":
    case "manual_required":
      return "Cần dán thủ công";
    default: {
      const _exhaustive: never = quality;
      return _exhaustive;
    }
  }
}

/** Mô tả ngắn cho tooltip / callout; null nếu không cần sub-text. */
export function getSourceQualityDescription(
  quality: SourceQuality,
): string | null {
  switch (quality) {
    case "metadata_only":
      return "Kết quả này dựa trên metadata/description, chưa phải transcript đầy đủ.";
    case "blocked":
    case "manual_required":
      return "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text.";
    default:
      return null;
  }
}

/** Variant `Badge` (cva) — khớp key trong `badge.tsx`. */
export type SourceQualityBadgeVariant =
  | "transcript"
  | "caption"
  | "paste_text"
  | "metadata_only"
  | "blocked"
  | "manual_required";

export function getSourceQualityBadgeVariant(
  quality: SourceQuality,
): SourceQualityBadgeVariant {
  return quality;
}
