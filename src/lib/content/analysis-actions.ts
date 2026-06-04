"use server";

import { revalidatePath } from "next/cache";

import { trackEvent } from "@/lib/analytics/tracker";
import { analyzeContentText, getActiveAiModelLabel } from "@/lib/ai/client";
import { getSafeAiErrorLog, mapAiProviderError } from "@/lib/ai/error-messages";
import { BreakdownContentError } from "@/lib/ai/errors";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import type { ActionResult } from "@/lib/boards/actions";
import {
  buildSummaryPayload,
  getContentAnalysisByItemId,
  getContentItemById,
} from "@/lib/content/analysis-queries";
import { createClient } from "@/lib/supabase/server";
import { getSourceQualityFromItem } from "@/lib/content/analysis-source-quality";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import { isValidUuid } from "@/lib/boards/utils";
import type { SourceQuality } from "@/lib/content/social-importer/types";

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

  const sourceQuality = getSourceQualityFromItem(item);

  if (sourceQuality === "blocked" || sourceQuality === "manual_required") {
    return {
      success: false,
      error:
        "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text.",
    };
  }

  const rawContent = item.rawContent?.trim() ?? "";
  if (rawContent.length === 0) {
    return {
      success: false,
      error: "Content này chỉ có URL. Hãy thêm nội dung thủ công.",
    };
  }

  const rateLimit = await checkAiRateLimit(supabase, user.id, "breakdown");
  if (!rateLimit.allowed) {
    return { success: false, error: rateLimit.message };
  }

  let analysisResult;
  let aiModel: string;

  try {
    const providerResult = await analyzeContentText({
      title: item.title,
      platform: getPlatformLabel(item.platform),
      rawContent,
      sourceUrl: item.sourceUrl,
      sourceQuality: toAnalysisSourceQualityHint(sourceQuality),
    });
    analysisResult = providerResult;
    aiModel = getActiveAiModelLabel();
  } catch (error) {
    if (error instanceof BreakdownContentError) {
      return { success: false, error: mapAiProviderError(error, "phân tích") };
    }
    console.warn("AI breakdown failed", getSafeAiErrorLog(error));
    return { success: false, error: mapAiProviderError(error, "phân tích") };
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
    await trackEvent(
      "breakdown_run",
      { content_id: contentItemId, model: aiModel },
      { workspaceId: item.workspaceId },
    );
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
  await trackEvent(
    "breakdown_run",
    { content_id: contentItemId, model: aiModel },
    { workspaceId: item.workspaceId },
  );
  return { success: true, data: { analysisId: data.id } };
}

function toAnalysisSourceQualityHint(
  quality: SourceQuality,
): "transcript" | "caption" | "paste_text" | "metadata_only" | null {
  if (
    quality === "transcript" ||
    quality === "caption" ||
    quality === "paste_text" ||
    quality === "metadata_only"
  ) {
    return quality;
  }
  return null;
}

function revalidateBreakdownPaths(contentItemId: string, boardId: string | null) {
  revalidatePath(`/breakdown/${contentItemId}`);
  if (boardId) {
    revalidatePath(`/boards/${boardId}`);
  }
  revalidatePath("/dashboard");
}
