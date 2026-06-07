/* eslint-disable @typescript-eslint/no-explicit-any */
import { inngest } from "../client";
import { createClient } from "@supabase/supabase-js";
import { analyzeContentText, getActiveAiModelLabel } from "@/lib/ai/client";
import { checkAiRateLimit } from "@/lib/ai/rate-limit";
import { BreakdownContentError } from "@/lib/ai/errors";
import { getSafeAiErrorLog, mapAiProviderError } from "@/lib/ai/error-messages";
import { getSourceQualityFromItem } from "@/lib/content/analysis-source-quality";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import type { SourceQuality } from "@/lib/content/social-importer/types";

// =============================================================================
// ENV
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let _supabase: ReturnType<typeof createClient> | null = null;
function getSupabase() {
  if (!_supabase) {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    _supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _supabase;
}

// =============================================================================
// INNGEST FUNCTION — Background AI Breakdown
// =============================================================================

export const analyzeContent = inngest.createFunction(
  {
    id: "analyze-content",
    name: "AI Breakdown — analyze content in background",
    retries: 3,
    concurrency: { limit: 5 },
  },
  { event: "content/analysis-requested" },
  async ({ event, step }) => {
    const { contentItemId, workspaceId, userId } = event.data as {
      contentItemId: string;
      workspaceId: string;
      userId?: string | null;
    };

    // STEP 1 — Fetch content item + existing analysis
    const { item, existingAnalysis } = await step.run("fetch-item", async (): Promise<{ item: NonNullable<Awaited<ReturnType<ReturnType<typeof getSupabase>["from"]>>["data"]>; existingAnalysis: { id: string; status: string } | null }> => {
      const { data: item, error: itemError } = await getSupabase()
        .from("content_items")
        .select("id, workspace_id, title, platform, source_url, raw_content, saved_by")
        .eq("id", contentItemId)
        .eq("workspace_id", workspaceId)
        .single();

      if (itemError) throw new Error(`Fetch content item failed: ${itemError.message}`);
      if (!item) throw new Error("Content item not found");

      const { data: existingAnalysis } = await getSupabase()
        .from("content_analyses")
        .select("id, status")
        .eq("content_item_id", contentItemId)
        .maybeSingle();

      return { item, existingAnalysis };
    });

    // STEP 2 — Mark pending (create or update row)
    await step.run("mark-pending", async () => {
      const now = new Date().toISOString();
      if (existingAnalysis?.id) {
        const { error } = await (getSupabase() as any)
          .from("content_analyses")
          .update({ status: "pending", updated_at: now })
          .eq("id", existingAnalysis.id);
        if (error) throw new Error(`Mark pending failed: ${error.message}`);
      } else {
        const { error } = await (getSupabase() as any).from("content_analyses").insert({
          content_item_id: contentItemId,
          workspace_id: workspaceId,
          status: "pending",
          created_at: now,
          updated_at: now,
        });
        if (error) throw new Error(`Create pending analysis failed: ${error.message}`);
      }
    });

    // STEP 3 — Rate-limit check (uses ai_rate_limits table)
    const effectiveUserId = userId ?? item.saved_by;
    if (effectiveUserId) {
      await step.run("rate-limit-check", async () => {
        const rateLimit = await checkAiRateLimit(getSupabase(), effectiveUserId, "breakdown");
        if (!rateLimit.allowed) {
          throw new Error(`Rate limited: ${rateLimit.message}`);
        }
      });
    }

    // STEP 4 — Resolve source quality + validate we have text
    const rawContent = item.raw_content?.trim() ?? "";
    if (!rawContent) {
      await markFailed(contentItemId, "Content item has no text to analyze.");
      return { contentItemId, status: "failed", reason: "empty_content" };
    }

    const sourceQuality = getSourceQualityFromItem({
      sourceUrl: item.source_url,
      rawContent: item.raw_content,
      platform: item.platform,
    });

    if (sourceQuality === "blocked" || sourceQuality === "manual_required") {
      await markFailed(
        contentItemId,
        "Could not extract caption/transcript from source. User must paste text manually.",
      );
      return { contentItemId, status: "failed", reason: "source_quality" };
    }

    // STEP 5 — Run AI analysis
    let analysisResult;
    let aiModel: string;

    try {
      analysisResult = await step.run("ai-analysis", async () => {
        return analyzeContentText({
          title: item.title,
          platform: getPlatformLabel(item.platform),
          rawContent,
          sourceUrl: item.source_url,
          sourceQuality: toAnalysisSourceQualityHint(sourceQuality),
        });
      });
      aiModel = getActiveAiModelLabel();
    } catch (error) {
      let reason = "ai_provider_error";
      let message = mapAiProviderError(error, "phân tích");

      if (error instanceof BreakdownContentError) {
        reason = "non_vietnamese_leak";
        message = mapAiProviderError(error, "phân tích");
      }

      console.warn("AI breakdown failed", getSafeAiErrorLog(error));
      await markFailed(contentItemId, message);
      return { contentItemId, status: "failed", reason };
    }

    // STEP 6 — Persist completed analysis
    const analyzedAt = new Date().toISOString();
    const summary = {
      emotion: analysisResult.emotion,
      target_audience: analysisResult.target_audience,
      why_it_works: analysisResult.why_it_works,
      remix_suggestions: analysisResult.remix_suggestions,
    };

    await step.run("persist-result", async () => {
      if (existingAnalysis?.id) {
        const { error } = await (getSupabase() as any)
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
            updated_at: analyzedAt,
          })
          .eq("id", existingAnalysis.id);
        if (error) throw new Error(`Update analysis failed: ${error.message}`);
      } else {
        const { error } = await (getSupabase() as any).from("content_analyses").insert({
          content_item_id: contentItemId,
          workspace_id: workspaceId,
          hook: analysisResult.hook,
          angle: analysisResult.angle,
          structure: analysisResult.structure,
          cta: analysisResult.cta,
          summary,
          ai_model: aiModel,
          status: "completed",
          analyzed_at: analyzedAt,
          created_at: analyzedAt,
          updated_at: analyzedAt,
        });
        if (error) throw new Error(`Insert analysis failed: ${error.message}`);
      }
    });

    if (effectiveUserId) {
      await step.sendEvent("notify-analysis-completed", {
        name: "content/analysis-completed",
        data: {
          workspaceId,
          userId: effectiveUserId,
          contentItemId,
          title: item.title,
        },
      });
    }

    return {
      contentItemId,
      status: "completed",
      aiModel,
      analyzedAt,
    };
  },
);

// =============================================================================
// HELPERS
// =============================================================================

async function markFailed(contentItemId: string, reason: string) {
  const now = new Date().toISOString();
  console.error(`[analyze-content] markFailed: ${contentItemId} — ${reason}`);
  const { error } = await (getSupabase() as any)
    .from("content_analyses")
    .update({ status: "failed", updated_at: now })
    .eq("content_item_id", contentItemId);

  if (error) {
    console.error(`Failed to mark analysis as failed: ${error.message}`);
  }
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
