import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreakdownView } from "@/components/custom/breakdown/breakdown-view";
import {
  getContentAnalysisByItemId,
  getContentItemById,
} from "@/lib/content/analysis-queries";
import { getSourceQualityFromItem } from "@/lib/content/analysis-source-quality";
import { enrichContentItemFromUrl } from "@/lib/content/enrich-url-content";
import type { SourceQuality } from "@/lib/content/social-importer/types";
import {
  fetchUrlEmbedMetadata,
  getLinkThumbnailUrl,
  resolveThumbnailUrl,
} from "@/lib/content/url-metadata";
import { createClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/boards/utils";

type BreakdownPageProps = {
  params: { contentItemId: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "AI Breakdown · Vietnamese Eden",
    description: "Phân tích nội dung bằng AI",
  };
}

export default async function BreakdownPage({ params }: BreakdownPageProps) {
  const { contentItemId } = params;

  if (!isValidUuid(contentItemId)) {
    notFound();
  }

  const supabase = createClient();
  const { item: initialItem, error: itemError } = await getContentItemById(
    supabase,
    contentItemId,
  );
  let item = initialItem;

  if (!item) {
    notFound();
  }

  let enrichError: string | null = null;
  let sourceQuality: SourceQuality = getSourceQualityFromItem(item);
  if (!item.rawContent?.trim() && item.sourceUrl?.trim()) {
    const enrichResult = await enrichContentItemFromUrl(supabase, contentItemId);
    if (enrichResult.item) {
      item = enrichResult.item;
    }
    enrichError = enrichResult.error;
    if (enrichResult.sourceQuality != null) {
      sourceQuality = enrichResult.sourceQuality;
    } else if (enrichResult.item) {
      sourceQuality = getSourceQualityFromItem(enrichResult.item);
    }
  }

  const { analysis, error: analysisError } = await getContentAnalysisByItemId(
    supabase,
    contentItemId,
  );

  const embedMeta =
    item.sourceUrl && !getLinkThumbnailUrl(item.sourceUrl, item.platform)
      ? await fetchUrlEmbedMetadata(item.sourceUrl)
      : null;
  const thumbnailUrl = resolveThumbnailUrl(item.sourceUrl, item.platform, embedMeta);

  const canAnalyze = Boolean(item.rawContent?.trim());
  const fetchError =
    [itemError, analysisError, enrichError].filter(Boolean).join(" ") || null;

  return (
    <BreakdownView
      item={item}
      analysis={analysis}
      canAnalyze={canAnalyze}
      thumbnailUrl={thumbnailUrl}
      fetchError={fetchError}
      sourceQuality={sourceQuality}
    />
  );
}
