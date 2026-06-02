import { makeWarning, nowIso } from "@/lib/content/social-importer/adapters/base";
import type {
  SocialImportResult,
  SocialUrlImporter,
} from "@/lib/content/social-importer/types";

function isLinkedInHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

/** LinkedIn — chưa hỗ trợ M8 (stub). */
export class LinkedInImporter implements SocialUrlImporter {
  canHandle(url: string): boolean {
    return isLinkedInHost(url);
  }

  async import(url: string): Promise<SocialImportResult> {
    return {
      platform: "linkedin",
      sourceUrl: url,
      sourceQuality: "manual_required",
      warnings: [
        makeWarning(
          "UNSUPPORTED_URL",
          "LinkedIn chưa được hỗ trợ trong M8. Hãy dán text bằng Paste text.",
          "info",
        ),
      ],
      fetchedAt: nowIso(),
    };
  }
}
