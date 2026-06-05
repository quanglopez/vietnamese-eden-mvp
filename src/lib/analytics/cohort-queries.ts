import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnalyticsEventType } from "@/types/analytics";
import type { BetaPersona } from "@/types/beta-testers";
import type { Database } from "@/types/database";

export type CohortEventRow = {
  persona: BetaPersona | null;
  event_type: AnalyticsEventType;
  count: number;
};

export type CohortAnalysis = {
  rows: CohortEventRow[];
  personas: BetaPersona[];
  totalAttributed: number;
  totalUnattributed: number;
  error: string | null;
};

const WORKSPACE_EVENT_TYPES: AnalyticsEventType[] = [
  "board_create",
  "content_add",
  "breakdown_run",
  "remix_run",
  "calendar_add",
];

const EMPTY_COHORT: CohortAnalysis = {
  rows: [],
  personas: [],
  totalAttributed: 0,
  totalUnattributed: 0,
  error: null,
};

/**
 * Fetch workspace-scoped analytics events grouped by tester persona.
 *
 * Strategy: fetch beta_testers and analytics_events separately, merge in JS
 * by user_id. This avoids Supabase nested-join fragility and keeps the
 * logic testable.
 *
 * - NULL persona = events from users not linked to any beta tester
 * - Only workspace-scoped events (board_create, content_add, etc.)
 * - Auth events (signup/login) excluded because workspace_id is null
 * - Confidence: high when many linked events, low when attribution sparse
 */
export async function getCohortAnalytics(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days = 30,
): Promise<CohortAnalysis> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // 1. Fetch beta testers for persona lookup
  const { data: testers, error: testerError } = await supabase
    .from("beta_testers")
    .select("user_id, persona")
    .eq("workspace_id", workspaceId);

  if (testerError) {
    return { ...EMPTY_COHORT, error: testerError.message };
  }

  // Build user_id → persona map
  const personaByUserId = new Map<string, BetaPersona>();
  const personas = new Set<BetaPersona>();

  for (const t of testers ?? []) {
    if (t.user_id) {
      personaByUserId.set(t.user_id, t.persona);
      personas.add(t.persona);
    }
  }

  // 2. Fetch workspace-scoped analytics events
  const { data: events, error: eventError } = await supabase
    .from("analytics_events")
    .select("event_type, user_id")
    .eq("workspace_id", workspaceId)
    .in("event_type", [...WORKSPACE_EVENT_TYPES])
    .gte("created_at", since.toISOString());

  if (eventError) {
    return { ...EMPTY_COHORT, error: eventError.message };
  }

  // 3. Group by (persona, event_type)
  const key = (persona: string, eventType: string) => `${persona}::${eventType}`;
  const buckets = new Map<string, number>();

  let totalAttributed = 0;
  let totalUnattributed = 0;

  for (const event of events ?? []) {
    const persona = event.user_id ? (personaByUserId.get(event.user_id) ?? "unattributed") : "unattributed";
    const k = key(persona, event.event_type);
    buckets.set(k, (buckets.get(k) ?? 0) + 1);

    if (persona === "unattributed") {
      totalUnattributed += 1;
    } else {
      totalAttributed += 1;
    }
  }

  // 4. Build rows
  const rows: CohortEventRow[] = [];
  Array.from(buckets.entries()).forEach(([k, count]) => {
    const [personaStr, eventType] = k.split("::");
    const persona: BetaPersona | null =
      personaStr === "unattributed" ? null : (personaStr as BetaPersona);
    rows.push({ persona, event_type: eventType as AnalyticsEventType, count });
  });

  return {
    rows,
    personas: Array.from(personas).sort(),
    totalAttributed,
    totalUnattributed,
    error: null,
  };
}
