import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { AnalyticsEventType } from "@/types/analytics";

export type AnalyticsEventCountRow = {
  event_type: AnalyticsEventType;
  count: number;
};

/**
 * Workspace-scoped event counts (last N days). Requires migration applied and
 * caller session with workspace admin RLS on analytics_events.
 *
 * **Does not include signup/login:** those events are stored with workspace_id = null
 * (Option A). This helper only counts rows for the given workspace_id. Do not use
 * it for full activation funnel metrics — auth events need a separate platform query.
 */
export async function getWorkspaceAnalyticsCounts(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days = 30,
): Promise<{ rows: AnalyticsEventCountRow[]; error: string | null }> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceIso = since.toISOString();

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type")
    .eq("workspace_id", workspaceId)
    .gte("created_at", sinceIso);

  if (error) {
    return { rows: [], error: error.message };
  }

  const counts = new Map<AnalyticsEventType, number>();
  for (const row of data ?? []) {
    const type = row.event_type as AnalyticsEventType;
    counts.set(type, (counts.get(type) ?? 0) + 1);
  }

  const rows = Array.from(counts.entries()).map(([event_type, count]) => ({
    event_type,
    count,
  }));

  return { rows, error: null };
}
