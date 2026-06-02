import type { SupabaseClient } from "@supabase/supabase-js";

import { getContentItemById } from "@/lib/content/analysis-queries";
import { importSocialUrl, pickAnalysisInput } from "@/lib/content/social-importer";
import type {
  SocialImportResult,
  SocialImportWarning,
  SourceQuality,
} from "@/lib/content/social-importer/types";
import { METADATA_AUTO_MARKER } from "@/lib/content/analysis-source-quality";
import type { Database } from "@/types/database";
import type { ContentItemDetail } from "@/types/analysis";

const METADATA_HEADER = `${METADATA_AUTO_MARKER} — không phải transcript/caption đầy đủ. Để phân tích sâu hơn, hãy dán caption/script qua Paste text.]`;

function buildEnrichedRawContentFromImport(
  importResult: SocialImportResult,
  analysisInput: string,
  warnings: SocialImportWarning[],
): string {
  const parts: string[] = [METADATA_HEADER, ""];

  if (importResult.title?.trim()) {
    parts.push(`Tiêu đề: ${importResult.title.trim()}`);
  }
  if (importResult.author?.trim()) {
    parts.push(`Kênh/tác giả: ${importResult.author.trim()}`);
  }

  parts.push("", "Bản dịch / nội dung có thể phân tích:", "", analysisInput);

  if (warnings.length > 0) {
    parts.push("", "[Cảnh báo đi kèm:]");
    for (const warning of warnings) {
      parts.push(`- ${warning.code}: ${warning.message}`);
    }
  }

  if (importResult.canonicalUrl?.trim() || importResult.sourceUrl?.trim()) {
    parts.push("", `Link gốc: ${importResult.canonicalUrl ?? importResult.sourceUrl}`);
  }

  return parts.join("\n").trim();
}

/**
 * Enrich URL-only content qua M8 `importSocialUrl` + `pickAnalysisInput` (ALE-159).
 * Trả `sourceQuality` transient cho badge Breakdown (chưa có cột DB).
 */
export async function enrichContentItemFromUrl(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{
  item: ContentItemDetail | null;
  enriched: boolean;
  error: string | null;
  sourceQuality?: SourceQuality | null;
}> {
  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);
  if (itemError) {
    return { item: null, enriched: false, error: itemError, sourceQuality: null };
  }
  if (!item) {
    return { item: null, enriched: false, error: null, sourceQuality: null };
  }

  if (item.rawContent?.trim()) {
    return { item, enriched: false, error: null, sourceQuality: null };
  }

  const sourceUrl = item.sourceUrl?.trim();
  if (!sourceUrl) {
    return { item, enriched: false, error: null, sourceQuality: null };
  }

  let importResult: SocialImportResult;
  try {
    importResult = await importSocialUrl(sourceUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể import URL.";
    return { item, enriched: false, error: message, sourceQuality: null };
  }

  const { input: analysisInput, quality: pickedQuality, warnings } =
    pickAnalysisInput(importResult, null);

  const sourceQuality: SourceQuality = analysisInput
    ? pickedQuality
    : importResult.sourceQuality;

  const nextTitle =
    importResult.title?.trim()?.slice(0, 200) || item.title;

  const rawContent = analysisInput
    ? buildEnrichedRawContentFromImport(importResult, analysisInput, warnings)
    : "";

  const { error: updateError } = await supabase
    .from("content_items")
    .update({
      raw_content: rawContent,
      title: nextTitle,
    })
    .eq("id", contentItemId);

  if (updateError) {
    return { item, enriched: false, error: updateError.message, sourceQuality: null };
  }

  const { item: updated, error: reloadError } = await getContentItemById(
    supabase,
    contentItemId,
  );
  if (reloadError) {
    return { item, enriched: true, error: reloadError, sourceQuality };
  }

  return { item: updated, enriched: true, error: null, sourceQuality };
}
