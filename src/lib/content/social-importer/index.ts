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

/** Registry adapter — Commit 2 sẽ gán danh sách thật. */
export const ADAPTERS: SocialUrlImporter[] = [];

/**
 * Import URL qua adapter phù hợp. Chưa kích hoạt cho đến Commit 2.
 */
export async function importSocialUrl(url: string): Promise<SocialImportResult> {
  void url;
  throw new Error(
    "importSocialUrl chưa được kích hoạt — Commit 2 sẽ wire registry",
  );
}
