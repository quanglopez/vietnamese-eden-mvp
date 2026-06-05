import type { SupabaseClient } from "@supabase/supabase-js";

import { ANALYTICS_EVENT_TYPES } from "@/types/analytics";
import type { AnalyticsEventType } from "@/types/analytics";
import type { CohortEventRow } from "./cohort-queries";
import type { ConfidenceLevel } from "@/types/analytics";
import type { Database } from "@/types/database";

export type AnalyticsEventCountRow = {
  event_type: AnalyticsEventType;
  count: number;
};

export type AnalyticsEventCounts = Record<AnalyticsEventType, number>;

export type AnalyticsActivityRow = {
  date: string;
  total: number;
  events: AnalyticsEventCounts;
};

export type AnalyticsFunnelStep = {
  eventType: AnalyticsEventType;
  label: string;
  count: number;
  conversionRate: number;
  dropOffFromPrevious: number;
};

type AnalyticsCountInput = {
  event_type: AnalyticsEventType;
};

type AnalyticsActivityInput = AnalyticsCountInput & {
  created_at: string;
};

const DASHBOARD_FUNNEL: Array<{ eventType: AnalyticsEventType; label: string }> = [
  { eventType: "login", label: "Đăng nhập" },
  { eventType: "board_create", label: "Tạo board" },
  { eventType: "content_add", label: "Thêm content" },
  { eventType: "breakdown_run", label: "Chạy breakdown" },
  { eventType: "remix_run", label: "Tạo remix" },
  { eventType: "calendar_add", label: "Lên lịch" },
];

export function createEmptyAnalyticsCounts(): AnalyticsEventCounts {
  return ANALYTICS_EVENT_TYPES.reduce((counts, eventType) => {
    counts[eventType] = 0;
    return counts;
  }, {} as AnalyticsEventCounts);
}

export function countAnalyticsEvents(rows: AnalyticsCountInput[]): AnalyticsEventCounts {
  const counts = createEmptyAnalyticsCounts();

  for (const row of rows) {
    if (row.event_type in counts) {
      counts[row.event_type] += 1;
    }
  }

  return counts;
}

export function mergeAnalyticsCounts(
  ...countsList: Partial<AnalyticsEventCounts>[]
): AnalyticsEventCounts {
  const merged = createEmptyAnalyticsCounts();

  for (const counts of countsList) {
    for (const eventType of ANALYTICS_EVENT_TYPES) {
      merged[eventType] += counts[eventType] ?? 0;
    }
  }

  return merged;
}

export function countRowsToAnalyticsCounts(
  rows: AnalyticsEventCountRow[],
): AnalyticsEventCounts {
  const counts = createEmptyAnalyticsCounts();

  for (const row of rows) {
    counts[row.event_type] = row.count;
  }

  return counts;
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function buildDailyActivity(
  rows: AnalyticsActivityInput[],
  days: number,
  now = new Date(),
): AnalyticsActivityRow[] {
  const safeDays = Math.max(1, Math.min(days, 30));
  const buckets = new Map<string, AnalyticsActivityRow>();

  for (let index = safeDays - 1; index >= 0; index -= 1) {
    const date = new Date(now);
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - index);
    const key = toDateKey(date);
    buckets.set(key, { date: key, total: 0, events: createEmptyAnalyticsCounts() });
  }

  for (const row of rows) {
    const key = toDateKey(new Date(row.created_at));
    const bucket = buckets.get(key);
    if (!bucket || !(row.event_type in bucket.events)) continue;

    bucket.events[row.event_type] += 1;
    bucket.total += 1;
  }

  return Array.from(buckets.values());
}

export function buildAnalyticsFunnel(counts: AnalyticsEventCounts): AnalyticsFunnelStep[] {
  const firstCount = counts.login;
  let previousCount = firstCount;

  return DASHBOARD_FUNNEL.map(({ eventType, label }, index) => {
    const count = counts[eventType] ?? 0;
    const conversionRate = firstCount > 0 ? Math.round((count / firstCount) * 100) : 0;
    const dropOffFromPrevious =
      index === 0 || previousCount === 0
        ? 0
        : Math.max(0, Math.round(((previousCount - count) / previousCount) * 100));
    previousCount = count;

    return { eventType, label, count, conversionRate, dropOffFromPrevious };
  });
}

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

  const counts = countAnalyticsEvents((data ?? []) as AnalyticsCountInput[]);
  const rows = ANALYTICS_EVENT_TYPES.filter((eventType) => counts[eventType] > 0).map(
    (event_type) => ({ event_type, count: counts[event_type] }),
  );

  return { rows, error: null };
}

export async function getAllTimeWorkspaceAnalyticsCounts(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ rows: AnalyticsEventCountRow[]; error: string | null }> {
  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type")
    .eq("workspace_id", workspaceId);

  if (error) {
    return { rows: [], error: error.message };
  }

  const counts = countAnalyticsEvents((data ?? []) as AnalyticsCountInput[]);
  const rows = ANALYTICS_EVENT_TYPES.filter((eventType) => counts[eventType] > 0).map(
    (event_type) => ({ event_type, count: counts[event_type] }),
  );

  return { rows, error: null };
}

export async function getWorkspaceAnalyticsActivity(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days = 30,
): Promise<{ rows: AnalyticsActivityRow[]; error: string | null }> {
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setUTCHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("analytics_events")
    .select("event_type, created_at")
    .eq("workspace_id", workspaceId)
    .gte("created_at", since.toISOString());

  if (error) {
    return { rows: buildDailyActivity([], days), error: error.message };
  }

  return {
    rows: buildDailyActivity((data ?? []) as AnalyticsActivityInput[], days),
    error: null,
  };
}

// ── Cohort / Persona helpers ──────────────────────────────────────────────

export type PersonaFunnel = {
  persona: string;
  steps: AnalyticsFunnelStep[];
  totalEvents: number;
  confidence: ConfidenceLevel;
};

function confidenceFromEvents(total: number, attributed: number): ConfidenceLevel {
  if (total === 0) return "low";
  if (total >= 10 && attributed >= 5) return "high";
  if (total >= 3) return "medium";
  return "low";
}

/**
 * Build per-persona funnels from cohort event rows.
 *
 * Each persona gets its own funnel with platform-auth counts merged in.
 * Confidence: High (>10 events, >5 attributed), Medium (3-10), Low (<3).
 * Unattributed events become a "Không xác định" persona group.
 */
export function buildPersonaFunnels(
  cohortRows: CohortEventRow[],
  platformAuth: Pick<AnalyticsEventCounts, "login" | "signup">,
): PersonaFunnel[] {
  // Group by persona
  const byPersona = new Map<string, AnalyticsEventCounts>();

  for (const row of cohortRows) {
    const persona = row.persona ?? "unattributed";
    let counts = byPersona.get(persona);
    if (!counts) {
      counts = createEmptyAnalyticsCounts();
      byPersona.set(persona, counts);
    }
    counts[row.event_type] = (counts[row.event_type] ?? 0) + row.count;
  }

  const funnels: PersonaFunnel[] = [];

  Array.from(byPersona.entries()).forEach(([persona, counts]) => {
    // Merge with platform auth counts
    const merged = mergeAnalyticsCounts(counts, platformAuth);

    const steps = buildAnalyticsFunnel(merged);
    const totalEvents = Object.values(counts).reduce((sum, c) => sum + c, 0);
    const attributed = persona === "unattributed" ? 0 : totalEvents;

    funnels.push({
      persona: persona === "unattributed" ? "Không xác định" : persona,
      steps,
      totalEvents,
      confidence: confidenceFromEvents(totalEvents, attributed),
    });
  });

  // Sort: attributed personas first, then unattributed
  return funnels.sort((a, b) => {
    if (a.persona === "Không xác định") return 1;
    if (b.persona === "Không xác định") return -1;
    return b.totalEvents - a.totalEvents;
  });
}
