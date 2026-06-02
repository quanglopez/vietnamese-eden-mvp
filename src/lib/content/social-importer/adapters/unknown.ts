import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

/** Fallback — luôn đặt cuối registry. */
export class UnknownUrlImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    void url;
    return true;
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "unknown",
      sourceUrl: url,
      sourceQuality: "manual_required",
      warnings: [
        makeWarning(
          "UNSUPPORTED_URL",
          "URL không thuộc platform được hỗ trợ (YouTube/TikTok/Instagram/Facebook/LinkedIn). Hãy dán text bằng Paste text.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
