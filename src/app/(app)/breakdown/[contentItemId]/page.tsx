import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BreakdownView } from "@/components/custom/breakdown/breakdown-view";
import {
  getContentAnalysisByItemId,
  getContentItemById,
} from "@/lib/content/analysis-queries";
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
  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);

  if (!item) {
    notFound();
  }

  const { analysis, error: analysisError } = await getContentAnalysisByItemId(
    supabase,
    contentItemId,
  );

  const canAnalyze = Boolean(item.rawContent?.trim());
  const fetchError = [itemError, analysisError].filter(Boolean).join(" ") || null;

  return (
    <BreakdownView
      item={item}
      analysis={analysis}
      canAnalyze={canAnalyze}
      fetchError={fetchError}
    />
  );
}
