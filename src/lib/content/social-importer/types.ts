/**
 * Chất lượng nguồn dùng cho AI Breakdown — M8 Social URL Importer.
 */
export type SourceQuality =
  | "paste_text"
  | "transcript"
  | "caption"
  | "metadata_only"
  | "blocked"
  | "manual_required";

/**
 * Nền tảng xã hội (mở rộng hơn enum DB `platform_type`).
 */
export type SocialPlatform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "unknown";

/** Mã cảnh báo chuẩn khi import URL. */
export type SocialImportWarningCode =
  | "TRANSCRIPT_UNAVAILABLE"
  | "CAPTION_UNAVAILABLE"
  | "METADATA_ONLY"
  | "PLATFORM_BLOCKED"
  | "THUMBNAIL_UNAVAILABLE"
  | "LOGIN_REQUIRED"
  | "RATE_LIMITED"
  | "UNSUPPORTED_URL"
  | "NON_VIETNAMESE_DETECTED";

/** Cảnh báo hiển thị cho user (tiếng Việt). */
export interface SocialImportWarning {
  code: SocialImportWarningCode;
  message: string;
  severity: "info" | "warning" | "error";
}

/**
 * Kết quả import URL — hợp đồng chuẩn M8 (spec section 3).
 */
export interface SocialImportResult {
  platform: SocialPlatform;
  sourceUrl: string;
  canonicalUrl?: string;

  title?: string;
  author?: string;
  thumbnailUrl?: string;
  captionText?: string;
  transcriptText?: string;
  metadataText?: string;

  analysisInput?: string;
  sourceQuality: SourceQuality;
  warnings: SocialImportWarning[];

  fetchedAt: string;
}

/**
 * Adapter import URL theo từng nền tảng.
 */
export interface SocialUrlImporter {
  canHandle(url: string): boolean;
  import(url: string): Promise<SocialImportResult>;
}
