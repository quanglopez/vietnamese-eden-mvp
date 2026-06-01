import type { SupabaseClient } from "@supabase/supabase-js";

import {
  buildEnrichedRawContent,
  fetchUrlEmbedMetadata,
} from "@/lib/content/url-metadata";
import { getContentItemById } from "@/lib/content/analysis-queries";
import type { Database } from "@/types/database";
import type { ContentItemDetail } from "@/types/analysis";

export async function enrichContentItemFromUrl(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{
  item: ContentItemDetail | null;
  enriched: boolean;
  error: string | null;
}> {
  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);
  if (itemError) {
    return { item: null, enriched: false, error: itemError };
  }
  if (!item) {
    return { item: null, enriched: false, error: null };
  }

  if (item.rawContent?.trim()) {
    return { item, enriched: false, error: null };
  }

  const sourceUrl = item.sourceUrl?.trim();
  if (!sourceUrl) {
    return { item, enriched: false, error: null };
  }

  const meta = await fetchUrlEmbedMetadata(sourceUrl);
  if (!meta) {
    return { item, enriched: false, error: null };
  }

  const rawContent = buildEnrichedRawContent(meta, sourceUrl);
  const nextTitle =
    meta.title && meta.title.length > 0
      ? meta.title.slice(0, 200)
      : item.title;

  const { error: updateError } = await supabase
    .from("content_items")
    .update({
      raw_content: rawContent,
      title: nextTitle,
    })
    .eq("id", contentItemId);

  if (updateError) {
    return { item, enriched: false, error: updateError.message };
  }

  const { item: updated, error: reloadError } = await getContentItemById(
    supabase,
    contentItemId,
  );
  if (reloadError) {
    return { item, enriched: true, error: reloadError };
  }

  return { item: updated, enriched: true, error: null };
}
