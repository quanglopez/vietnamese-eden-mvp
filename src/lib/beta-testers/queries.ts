import type { SupabaseClient } from "@supabase/supabase-js";

import {
  computeCoreFlowFromEventTypes,
  type BetaTesterRow,
  type BetaTesterWithHint,
  type ComputedCoreFlowStatus,
} from "@/types/beta-testers";
import type { Database } from "@/types/database";

const CORE_FLOW_EVENT_TYPES = [
  "board_create",
  "content_add",
  "breakdown_run",
  "remix_run",
] as const;

export async function listBetaTesters(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ testers: BetaTesterRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("beta_testers")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    return { testers: [], error: error.message };
  }

  return { testers: data ?? [], error: null };
}

export async function getCoreFlowHintsForUsers(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  userIds: string[],
): Promise<Record<string, ComputedCoreFlowStatus>> {
  const uniqueIds = [...new Set(userIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("analytics_events")
    .select("user_id, event_type")
    .eq("workspace_id", workspaceId)
    .in("user_id", uniqueIds)
    .in("event_type", [...CORE_FLOW_EVENT_TYPES]);

  if (error || !data) {
    return {};
  }

  const eventsByUser = new Map<string, Set<string>>();
  for (const row of data) {
    if (!row.user_id) continue;
    const set = eventsByUser.get(row.user_id) ?? new Set<string>();
    set.add(row.event_type);
    eventsByUser.set(row.user_id, set);
  }

  const hints: Record<string, ComputedCoreFlowStatus> = {};
  for (const userId of uniqueIds) {
    const types = eventsByUser.get(userId);
    hints[userId] = computeCoreFlowFromEventTypes(types ?? []);
  }

  return hints;
}

export function attachCoreFlowHints(
  testers: BetaTesterRow[],
  hints: Record<string, ComputedCoreFlowStatus>,
): BetaTesterWithHint[] {
  return testers.map((tester) => ({
    ...tester,
    analyticsCoreFlowHint: tester.user_id ? (hints[tester.user_id] ?? null) : null,
  }));
}

export async function listBetaTestersWithHints(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ testers: BetaTesterWithHint[]; error: string | null }> {
  const { testers, error } = await listBetaTesters(supabase, workspaceId);
  if (error) {
    return { testers: [], error };
  }

  const userIds = testers.map((t) => t.user_id).filter((id): id is string => Boolean(id));
  const hints = await getCoreFlowHintsForUsers(supabase, workspaceId, userIds);

  return {
    testers: attachCoreFlowHints(testers, hints),
    error: null,
  };
}
