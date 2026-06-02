import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

/** Instagram — stub blocked (ALE-157). */
export class InstagramImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "instagram";
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "instagram",
      sourceUrl: url,
      sourceQuality: "blocked",
      warnings: [
        makeWarning(
          "LOGIN_REQUIRED",
          "Instagram oEmbed yêu cầu đăng nhập — hãy dán caption bằng Paste text.",
          "warning",
        ),
        makeWarning(
          "PLATFORM_BLOCKED",
          "Không thể scrape Instagram từ server.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
