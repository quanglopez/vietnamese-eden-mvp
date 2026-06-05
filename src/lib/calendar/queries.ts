import type { SupabaseClient } from "@supabase/supabase-js";

import { getCalendarChannelLabel } from "@/lib/calendar/constants";
import { parseCalendarNotes, resolveChannel } from "@/lib/calendar/notes";
import type { CalendarItemView } from "@/types/calendar";
import type { Database } from "@/types/database";
import type { PlatformType } from "@/types/content";

function truncatePreview(text: string | null | undefined, max = 200): string | null {
  if (!text?.trim()) {
    return null;
  }
  const t = text.trim();
  return t.length > max ? `${t.slice(0, max)}…` : t;
}

type CalendarRow = {
  id: string;
  workspace_id: string;
  generated_output_id: string | null;
  content_item_id: string | null;
  title: string;
  platform: PlatformType;
  scheduled_at: string;
  status: "scheduled" | "published" | "skipped" | "failed";
  notes: string | null;
  created_at: string;
  generated_outputs: {
    id: string;
    title: string | null;
    content: string;
    source_content_item_id: string | null;
  } | null;
};

function mapCalendarRow(row: CalendarRow): CalendarItemView {
  const parsed = parseCalendarNotes(row.notes);
  const channel = parsed.channel ?? resolveChannel(row.platform, row.notes);

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    generatedOutputId: row.generated_output_id,
    contentItemId: row.content_item_id ?? row.generated_outputs?.source_content_item_id ?? null,
    title: row.title,
    platform: row.platform,
    channel,
    channelLabel: getCalendarChannelLabel(channel),
    scheduledAt: row.scheduled_at,
    status: row.status,
    notes: row.notes,
    userNotes: parsed.userNotes,
    contentPreview: truncatePreview(row.generated_outputs?.content),
    outputTitle: row.generated_outputs?.title ?? null,
    createdAt: row.created_at,
  };
}

export async function listCalendarItemsForWorkspace(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ items: CalendarItemView[]; error: string | null }> {
  const { data, error } = await supabase
    .from("content_calendar_items")
    .select(
      `
      id,
      workspace_id,
      generated_output_id,
      content_item_id,
      title,
      platform,
      scheduled_at,
      status,
      notes,
      created_at,
      generated_outputs (
        id,
        title,
        content,
        source_content_item_id
      )
    `,
    )
    .eq("workspace_id", workspaceId)
    .order("scheduled_at", { ascending: true });

  if (error) {
    return { items: [], error: error.message };
  }

  const items = (data ?? []).map((row) => mapCalendarRow(row as CalendarRow));
  return { items, error: null };
}

export function splitUpcomingAndPast(items: CalendarItemView[]): {
  upcoming: CalendarItemView[];
  past: CalendarItemView[];
} {
  const now = Date.now();
  const upcoming: CalendarItemView[] = [];
  const past: CalendarItemView[] = [];

  for (const item of items) {
    if (new Date(item.scheduledAt).getTime() >= now) {
      upcoming.push(item);
    } else {
      past.push(item);
    }
  }

  return { upcoming, past };
}

export function groupItemsByWeekDay(
  items: CalendarItemView[],
  weekStart: Date,
): Record<number, CalendarItemView[]> {
  const groups: Record<number, CalendarItemView[]> = {
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
  };

  const startMs = weekStart.getTime();
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;

  for (const item of items) {
    const t = new Date(item.scheduledAt).getTime();
    if (t < startMs || t >= endMs) {
      continue;
    }
    const dayIndex = Math.floor((t - startMs) / (24 * 60 * 60 * 1000));
    if (dayIndex >= 0 && dayIndex < 7) {
      const bucket = groups[dayIndex];
      if (bucket) {
        bucket.push(item);
      }
    }
  }

  return groups;
}

export function getWeekStartMonday(reference: Date = new Date()): Date {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export async function getWorkspaceCalendarCount(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from("content_calendar_items")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId);

  if (error) {
    return 0;
  }
  return count ?? 0;
}
