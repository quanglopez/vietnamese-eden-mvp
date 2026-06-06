import { createClient } from "@supabase/supabase-js";

import { MAX_EXPORT_BATCH } from "@/lib/export/constants";
import type { Database } from "@/types/database";

// =============================================================================
// ENV — Supabase service role (bypass RLS cho job nền)
// =============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY");
}

export const exportSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export { MAX_EXPORT_BATCH };

export const NOTION_RICH_TEXT_MAX = 1900;

export type ContentBreakdown = {
  hook: string;
  angle: string;
  structure: string;
  cta: string;
};

export type CalendarExportItem = {
  id: string;
  title: string;
  platform: Database["public"]["Tables"]["content_calendar_items"]["Row"]["platform"];
  scheduled_at: string;
  status: Database["public"]["Tables"]["content_calendar_items"]["Row"]["status"];
  breakdown: ContentBreakdown;
};

type CalendarRow = {
  id: string;
  workspace_id: string;
  generated_output_id: string | null;
  content_item_id: string | null;
  title: string;
  platform: CalendarExportItem["platform"];
  scheduled_at: string;
  status: CalendarExportItem["status"];
};

type AnalysisRow = {
  hook: string | null;
  angle: string | null;
  structure: string | null;
  cta: string | null;
};

const EMPTY_BREAKDOWN: ContentBreakdown = {
  hook: "",
  angle: "",
  structure: "",
  cta: "",
};

/**
 * Chuẩn hóa UTF-8 (NFC) và loại ký tự điều khiển — an toàn cho tiếng Việt
 * khi gửi qua Composio / Notion / Google Sheets.
 */
export function toExportSafeText(value: string | null | undefined, fallback = ""): string {
  const raw = (value ?? fallback).normalize("NFC");
  return raw
    .replace(/\0/g, "")
    .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

export function chunkExportText(text: string, maxLen = NOTION_RICH_TEXT_MAX): string[] {
  if (text.length <= maxLen) {
    return text.length > 0 ? [text] : [""];
  }

  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxLen) {
    chunks.push(text.slice(i, i + maxLen));
  }
  return chunks;
}

export function extractNotionPageId(data: unknown): string {
  if (typeof data !== "object" || data === null) {
    throw new Error("Phản hồi Notion không hợp lệ — thiếu page id.");
  }

  const record = data as Record<string, unknown>;

  if (typeof record.id === "string" && record.id.length > 0) {
    return record.id;
  }

  const nestedPage = record.page;
  if (typeof nestedPage === "object" && nestedPage !== null && "id" in nestedPage) {
    const pageId = (nestedPage as { id: unknown }).id;
    if (typeof pageId === "string" && pageId.length > 0) {
      return pageId;
    }
  }

  throw new Error("Phản hồi Notion không hợp lệ — thiếu page id.");
}

async function resolveContentItemId(calendarItem: CalendarRow): Promise<string | null> {
  if (calendarItem.content_item_id) {
    return calendarItem.content_item_id;
  }

  if (!calendarItem.generated_output_id) {
    return null;
  }

  const { data, error } = await exportSupabase
    .from("generated_outputs")
    .select("source_content_item_id")
    .eq("id", calendarItem.generated_output_id)
    .eq("workspace_id", calendarItem.workspace_id)
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể resolve content item: ${error.message}`);
  }

  return data?.source_content_item_id ?? null;
}

async function fetchBreakdown(
  contentItemId: string,
  workspaceId: string,
): Promise<ContentBreakdown> {
  const { data, error } = await exportSupabase
    .from("content_analyses")
    .select("hook, angle, structure, cta")
    .eq("content_item_id", contentItemId)
    .eq("workspace_id", workspaceId)
    .eq("status", "completed")
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể tải AI Breakdown: ${error.message}`);
  }

  if (!data) {
    return EMPTY_BREAKDOWN;
  }

  const row = data as AnalysisRow;
  return {
    hook: toExportSafeText(row.hook),
    angle: toExportSafeText(row.angle),
    structure: toExportSafeText(row.structure),
    cta: toExportSafeText(row.cta),
  };
}

export async function loadCalendarExportItems(
  calendarItemIds: string[],
  workspaceId: string,
): Promise<CalendarExportItem[]> {
  if (calendarItemIds.length === 0) {
    return [];
  }

  const { data, error } = await exportSupabase
    .from("content_calendar_items")
    .select(
      "id, workspace_id, generated_output_id, content_item_id, title, platform, scheduled_at, status",
    )
    .eq("workspace_id", workspaceId)
    .in("id", calendarItemIds);

  if (error) {
    throw new Error(`Không thể tải mục lịch: ${error.message}`);
  }

  const rows = (data ?? []) as CalendarRow[];
  const byId = new Map(rows.map((row) => [row.id, row]));

  const items: CalendarExportItem[] = [];

  for (const id of calendarItemIds) {
    const row = byId.get(id);
    if (!row) {
      continue;
    }

    const contentItemId = await resolveContentItemId(row);
    const breakdown =
      contentItemId !== null
        ? await fetchBreakdown(contentItemId, workspaceId)
        : EMPTY_BREAKDOWN;

    items.push({
      id: row.id,
      title: toExportSafeText(row.title, "Không có tiêu đề"),
      platform: row.platform,
      scheduled_at: row.scheduled_at,
      status: row.status,
      breakdown,
    });
  }

  return items;
}

export function buildNotionBreakdownBlocks(
  breakdown: ContentBreakdown,
): Array<{
  type: "heading_2" | "paragraph";
  text: string;
}> {
  const sections = [
    { heading: "Hook (Móc mở)", value: breakdown.hook },
    { heading: "Góc nhìn (Angle)", value: breakdown.angle },
    { heading: "Cấu trúc (Structure)", value: breakdown.structure },
    { heading: "CTA", value: breakdown.cta },
  ] as const;

  const blocks: Array<{ type: "heading_2" | "paragraph"; text: string }> = [];

  for (const section of sections) {
    blocks.push({
      type: "heading_2",
      text: section.heading,
    });

    const body = toExportSafeText(section.value, "—");
    for (const chunk of chunkExportText(body)) {
      blocks.push({
        type: "paragraph",
        text: chunk,
      });
    }
  }

  return blocks;
}

export function buildSheetRow(item: CalendarExportItem): string[] {
  return [
    item.title,
    item.platform,
    item.breakdown.hook,
    item.breakdown.angle,
    item.breakdown.structure,
    item.breakdown.cta,
    item.scheduled_at,
    item.status,
  ];
}
