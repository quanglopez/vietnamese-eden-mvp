"use server";

import { inngest } from "@/lib/inngest";

/**
 * Manually queue a background AI Breakdown for a content item.
 *
 * Call this when the user clicks "Analyze" but you want to defer
 * to Inngest instead of blocking the UI with a synchronous call.
 * The existing server action `runContentAnalysisAction` is the
 * synchronous path; this is the async background path.
 *
 * The Supabase trigger (migration 20260606160000) will ALSO fire
 * automatically when raw_content is updated from empty → text.
 */
export async function requestBreakdownEvent(params: {
  contentItemId: string;
  workspaceId: string;
  userId?: string | null;
}) {
  const { contentItemId, workspaceId, userId } = params;

  const { ids } = await inngest.send({
    name: "content/analysis-requested",
    data: {
      contentItemId,
      workspaceId,
      userId,
    },
  });

  return { sent: true, eventIds: ids };
}
