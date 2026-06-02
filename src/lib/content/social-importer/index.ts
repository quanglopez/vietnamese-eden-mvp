import { FacebookImporter } from "@/lib/content/social-importer/adapters/facebook";
import { InstagramImporter } from "@/lib/content/social-importer/adapters/instagram";
import { LinkedInImporter } from "@/lib/content/social-importer/adapters/linkedin";
import { TikTokImporter } from "@/lib/content/social-importer/adapters/tiktok";
import { UnknownUrlImporter } from "@/lib/content/social-importer/adapters/unknown";
import { YouTubeImporter } from "@/lib/content/social-importer/adapters/youtube";
import { pickAnalysisInput } from "@/lib/content/social-importer/priority";
import type {
  SocialImportResult,
  SocialImportWarning,
  SocialImportWarningCode,
  SocialPlatform,
  SocialUrlImporter,
  SourceQuality,
} from "@/lib/content/social-importer/types";

export type {
  SocialImportResult,
  SocialImportWarning,
  SocialImportWarningCode,
  SocialPlatform,
  SocialUrlImporter,
  SourceQuality,
};

export { pickAnalysisInput };

/** Registry adapter — thứ tự quan trọng; Unknown luôn cuối. */
export const ADAPTERS: SocialUrlImporter[] = [
  new YouTubeImporter(),
  new TikTokImporter(),
  new InstagramImporter(),
  new FacebookImporter(),
  new LinkedInImporter(),
  new UnknownUrlImporter(),
];

/**
 * Import URL qua adapter đầu tiên khớp `canHandle`.
 */
export async function importSocialUrl(url: string): Promise<SocialImportResult> {
  for (const adapter of ADAPTERS) {
    if (adapter.canHandle(url)) {
      return adapter.import(url);
    }
  }

  throw new Error("Không có adapter nào khớp URL — kiểm tra registry.");
}
