import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

/** TikTok — stub blocked (ALE-156 sẽ xử lý oEmbed). */
export class TikTokImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "tiktok";
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "tiktok",
      sourceUrl: url,
      sourceQuality: "blocked",
      warnings: [
        makeWarning(
          "PLATFORM_BLOCKED",
          "TikTok đang chặn oEmbed từ IP cloud. Hãy dán caption/script bằng Paste text.",
          "warning",
        ),
        makeWarning(
          "RATE_LIMITED",
          "TikTok oEmbed không đáng tin cậy trên shared egress — tạm thời chặn.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
