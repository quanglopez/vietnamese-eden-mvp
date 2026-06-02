import type {
  SocialImportWarning,
  SocialImportWarningCode,
} from "@/lib/content/social-importer/types";

/** ISO 8601 hiện tại — dùng cho `fetchedAt` trên stub. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Tạo cảnh báo import với message tiếng Việt. */
export function makeWarning(
  code: SocialImportWarningCode,
  message: string,
  severity: SocialImportWarning["severity"] = "info",
): SocialImportWarning {
  return { code, message, severity };
}
