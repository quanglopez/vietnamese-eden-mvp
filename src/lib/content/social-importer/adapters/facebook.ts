import { detectPlatformFromUrl } from "@/lib/content/platform-detect";
import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

/** Facebook — chưa hỗ trợ M8 (stub). */
export class FacebookImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    return detectPlatformFromUrl(url).platform === "facebook";
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "facebook",
      sourceUrl: url,
      sourceQuality: "manual_required",
      warnings: [
        makeWarning(
          "UNSUPPORTED_URL",
          "Facebook chưa được hỗ trợ trong M8. Hãy dán text bằng Paste text.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
