import type {
  SocialImportResult,
  SocialImportWarning,
  SourceQuality,
} from "@/lib/content/social-importer/types";

const MIN_TRANSCRIPT_LENGTH = 100;
const MIN_CAPTION_LENGTH = 50;
const MIN_PASTE_LENGTH = 50;

function resolveMetadataText(result: SocialImportResult): string | null {
  const compact = result.metadataText?.trim();
  if (compact) {
    return compact;
  }

  const title = result.title?.trim();
  if (!title) {
    return null;
  }

  const parts = [`Tiêu đề: ${title}`];
  const author = result.author?.trim();
  if (author) {
    parts.push(`Kênh/tác giả: ${author}`);
  }
  return parts.join("\n\n");
}

/**
 * Chọn nội dung tốt nhất cho AI Breakdown theo thứ tự ưu tiên (spec section 4).
 * Hàm thuần — không I/O, không side effect.
 */
export function pickAnalysisInput(
  result: SocialImportResult,
  pasteText: string | null | undefined,
): {
  input: string | null;
  quality: SourceQuality;
  warnings: SocialImportWarning[];
} {
  const warnings: SocialImportWarning[] = [...result.warnings];

  const transcript = result.transcriptText?.trim() ?? "";
  if (transcript.length >= MIN_TRANSCRIPT_LENGTH) {
    return { input: transcript, quality: "transcript", warnings };
  }

  const caption = result.captionText?.trim() ?? "";
  if (caption.length >= MIN_CAPTION_LENGTH) {
    return { input: caption, quality: "caption", warnings };
  }

  const paste = pasteText?.trim() ?? "";
  if (paste.length >= MIN_PASTE_LENGTH) {
    return { input: paste, quality: "paste_text", warnings };
  }

  const metadata = resolveMetadataText(result);
  if (metadata) {
    return { input: metadata, quality: "metadata_only", warnings };
  }

  const hasPartialMetadata =
    Boolean(result.title?.trim()) ||
    Boolean(result.author?.trim()) ||
    Boolean(result.metadataText?.trim());

  if (hasPartialMetadata) {
    warnings.push({
      code: "METADATA_ONLY",
      message:
        "Metadata không đủ dài để phân tích AI. Hãy dán caption/script bằng Paste text.",
      severity: "info",
    });
  } else {
    warnings.push({
      code: "UNSUPPORTED_URL",
      message:
        "Không đủ nội dung để phân tích AI. Hãy dán caption/script bằng Paste text.",
      severity: "info",
    });
  }

  return { input: null, quality: "manual_required", warnings };
}
