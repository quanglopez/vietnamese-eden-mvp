import type { SupabaseClient } from "@supabase/supabase-js";

import type { WeeklySummaryCounts } from "@/lib/feedback/auto-classify";
import type {
  FeedbackCategory,
  FeedbackEntryRow,
  FeedbackPriority,
  FeedbackStatus,
} from "@/types/feedback";
import type { Database } from "@/types/database";

export type FeedbackListFilters = {
  status?: FeedbackStatus | "all";
  category?: FeedbackCategory | "all";
  priority?: FeedbackPriority | "all" | "unset";
};

export async function listFeedbackEntries(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  filters?: FeedbackListFilters,
): Promise<{ entries: FeedbackEntryRow[]; error: string | null }> {
  let query = supabase
    .from("feedback_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters?.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters?.priority === "unset") {
    query = query.is("priority", null);
  } else if (filters?.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const { data, error } = await query;

  if (error) {
    return { entries: [], error: error.message };
  }

  return { entries: data ?? [], error: null };
}

function emptyCategoryCounts(): Record<FeedbackCategory, number> {
  return { bug: 0, ux: 0, fr: 0, ai: 0, price: 0, positive: 0 };
}

export function buildWeeklySummary(
  entries: FeedbackEntryRow[],
  days = 7,
): WeeklySummaryCounts {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => new Date(e.created_at).getTime() >= cutoff);

  const byCategory = emptyCategoryCounts();
  const byPriority = { p0: 0, p1: 0, p2: 0, p3: 0, unset: 0 };
  let untriaged = 0;
  let triaged = 0;
  let actioned = 0;
  let closed = 0;

  for (const entry of recent) {
    byCategory[entry.category] += 1;
    if (entry.priority === "p0") byPriority.p0 += 1;
    else if (entry.priority === "p1") byPriority.p1 += 1;
    else if (entry.priority === "p2") byPriority.p2 += 1;
    else if (entry.priority === "p3") byPriority.p3 += 1;
    else byPriority.unset += 1;

    if (entry.status === "untriaged") untriaged += 1;
    else if (entry.status === "triaged") triaged += 1;
    else if (entry.status === "actioned") actioned += 1;
    else if (entry.status === "closed") closed += 1;
  }

  const end = new Date();
  const start = new Date(cutoff);
  const fmt = (d: Date) =>
    d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  return {
    periodLabel: `${fmt(start)} – ${fmt(end)}`,
    total: recent.length,
    untriaged,
    triaged,
    actioned,
    closed,
    byCategory,
    byPriority,
  };
}

export async function getFeedbackWeeklySummary(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  days = 7,
): Promise<{ stats: WeeklySummaryCounts; error: string | null }> {
  const { entries, error } = await listFeedbackEntries(supabase, workspaceId);
  if (error) {
    return {
      stats: {
        periodLabel: "",
        total: 0,
        untriaged: 0,
        triaged: 0,
        actioned: 0,
        closed: 0,
        byCategory: emptyCategoryCounts(),
        byPriority: { p0: 0, p1: 0, p2: 0, p3: 0, unset: 0 },
      },
      error,
    };
  }

  return { stats: buildWeeklySummary(entries, days), error: null };
}
