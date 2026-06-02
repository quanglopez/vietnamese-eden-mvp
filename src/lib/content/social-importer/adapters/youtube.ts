import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

/**
 * YouTube — stub foundation (ALE-154).
 * Fetch transcript/metadata thật: ALE-155.
 */
export class YouTubeImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "youtube";
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "youtube",
      sourceUrl: url,
      canonicalUrl: url,
      sourceQuality: "metadata_only",
      warnings: [
        makeWarning(
          "METADATA_ONLY",
          "Chỉ lấy được metadata — chưa có transcript/caption đầy đủ.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
