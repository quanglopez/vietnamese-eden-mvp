"use server";

import { revalidatePath } from "next/cache";

import { analyzeContentText } from "@/lib/ai/client";
import { AiProviderError } from "@/lib/ai/errors";
import type { ActionResult } from "@/lib/boards/actions";
import {
  buildSummaryPayload,
  getContentAnalysisByItemId,
  getContentItemById,
} from "@/lib/content/analysis-queries";
import { createClient } from "@/lib/supabase/server";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import { isValidUuid } from "@/lib/boards/utils";

export async function runContentAnalysisAction(
  contentItemId: string,
): Promise<ActionResult<{ analysisId: string }>> {
  if (!isValidUuid(contentItemId)) {
    return { success: false, error: "Content item không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để phân tích." };
  }

  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);
  if (itemError) {
    return { success: false, error: itemError };
  }
  if (!item) {
    return { success: false, error: "Không tìm thấy nội dung hoặc bạn không có quyền truy cập." };
  }

  const rawContent = item.rawContent?.trim() ?? "";
  if (rawContent.length === 0) {
    return {
      success: false,
      error:
        "Content này chỉ có URL. Hãy thêm nội dung thủ công trước khi phân tích.",
    };
  }

  let analysisResult;
  let aiModel: string;

  try {
    const providerResult = await analyzeContentText({
      title: item.title,
      platform: getPlatformLabel(item.platform),
      rawContent,
      sourceUrl: item.sourceUrl,
    });
    analysisResult = providerResult;
    aiModel =
      process.env.AI_USE_MOCK === "true" && process.env.NODE_ENV !== "production"
        ? "mock-dev"
        : process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Phân tích AI thất bại.",
    };
  }

  const summary = buildSummaryPayload(analysisResult);
  const analyzedAt = new Date().toISOString();

  const { analysis: existingAnalysis } = await getContentAnalysisByItemId(
    supabase,
    contentItemId,
  );

  if (existingAnalysis) {
    const { data, error } = await supabase
      .from("content_analyses")
      .update({
        hook: analysisResult.hook,
        angle: analysisResult.angle,
        structure: analysisResult.structure,
        cta: analysisResult.cta,
        summary,
        ai_model: aiModel,
        status: "completed",
        analyzed_at: analyzedAt,
      })
      .eq("content_item_id", contentItemId)
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message ?? "Không thể cập nhật phân tích." };
    }

    revalidateBreakdownPaths(contentItemId, item.boardId);
    return { success: true, data: { analysisId: data.id } };
  }

  const { data, error } = await supabase
    .from("content_analyses")
    .insert({
      content_item_id: contentItemId,
      workspace_id: item.workspaceId,
      hook: analysisResult.hook,
      angle: analysisResult.angle,
      structure: analysisResult.structure,
      cta: analysisResult.cta,
      summary,
      ai_model: aiModel,
      status: "completed",
      analyzed_at: analyzedAt,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể lưu phân tích." };
  }

  revalidateBreakdownPaths(contentItemId, item.boardId);
  return { success: true, data: { analysisId: data.id } };
}

function revalidateBreakdownPaths(contentItemId: string, boardId: string | null) {
  revalidatePath(`/breakdown/${contentItemId}`);
  if (boardId) {
    revalidatePath(`/boards/${boardId}`);
  }
  revalidatePath("/dashboard");
}
