import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getRemixFormatLabel,
  getRemixToneLabel,
} from "@/lib/remix/constants";
import { getDisplayTitle, getAngleLabelFromDisplayTitle, parseOutputTitle } from "@/lib/remix/metadata";
import type { GeneratedOutputView, RemixPageContext } from "@/types/remix";
import type { Database } from "@/types/database";

import { getContentAnalysisByItemId, getContentItemById } from "./analysis-queries";

function mapOutputRow(row: {
  id: string;
  source_content_item_id: string | null;
  title: string | null;
  content: string;
  status: "draft" | "ready" | "published" | "archived";
  created_at: string;
}): GeneratedOutputView | null {
  if (!row.source_content_item_id) {
    return null;
  }

  const meta = parseOutputTitle(row.title);
  if (!meta) {
    const displayTitle = getDisplayTitle(row.title);
    return {
      id: row.id,
      contentItemId: row.source_content_item_id,
      title: displayTitle,
      content: row.content,
      format: "facebook_post",
      formatLabel: "Remix",
      tone: "friendly",
      toneLabel: "—",
      variantIndex: 0,
      angleLabel: getAngleLabelFromDisplayTitle(displayTitle, 0),
      status: row.status,
      createdAt: row.created_at,
    };
  }

  const displayTitle = getDisplayTitle(row.title);

  return {
    id: row.id,
    contentItemId: row.source_content_item_id,
    title: displayTitle,
    content: row.content,
    format: meta.format,
    formatLabel: getRemixFormatLabel(meta.format),
    tone: meta.tone,
    toneLabel: getRemixToneLabel(meta.tone),
    variantIndex: meta.variantIndex,
    angleLabel: getAngleLabelFromDisplayTitle(displayTitle, meta.variantIndex),
    status: row.status,
    createdAt: row.created_at,
  };
}

export async function listGeneratedOutputsByItemId(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{ outputs: GeneratedOutputView[]; error: string | null }> {
  const { data, error } = await supabase
    .from("generated_outputs")
    .select("id, source_content_item_id, title, content, status, created_at")
    .eq("source_content_item_id", contentItemId)
    .order("created_at", { ascending: false });

  if (error) {
    return { outputs: [], error: error.message };
  }

  const outputs = (data ?? [])
    .map((row) => mapOutputRow(row))
    .filter((row): row is GeneratedOutputView => row !== null);

  return { outputs, error: null };
}

export async function getRemixPageContext(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{ context: RemixPageContext | null; error: string | null }> {
  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);
  if (itemError) {
    return { context: null, error: itemError };
  }
  if (!item) {
    return { context: null, error: null };
  }

  const { analysis, error: analysisError } = await getContentAnalysisByItemId(
    supabase,
    contentItemId,
  );
  if (analysisError) {
    return { context: null, error: analysisError };
  }

  const hasRawContent = Boolean(item.rawContent?.trim());
  const hasAnalysis = Boolean(analysis);
  const canAccess = hasRawContent || hasAnalysis;

  let blockReason: string | null = null;
  if (!canAccess) {
    blockReason =
      "Content này chỉ có URL. Hãy thêm nội dung thủ công và phân tích AI trước khi tạo remix.";
  } else if (!hasAnalysis) {
    blockReason = "Hãy phân tích AI trước khi tạo remix.";
  }

  return {
    context: {
      itemId: item.id,
      itemTitle: item.title,
      boardId: item.boardId,
      hasRawContent,
      hasAnalysis,
      canGenerate: hasAnalysis,
      blockReason,
    },
    error: null,
  };
}

export async function getWorkspaceRemixCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("generated_outputs")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .in("status", ["draft", "ready", "published"]);

  if (error) {
    return 0;
  }
  return count ?? 0;
}
