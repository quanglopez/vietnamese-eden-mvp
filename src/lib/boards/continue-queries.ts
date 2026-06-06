import type { SupabaseClient } from "@supabase/supabase-js";

import { getBoardEmoji, getBoardGradient } from "@/lib/boards/constants";
import type { Database } from "@/types/database";

/**
 * Represents a board with its funnel progress for the "Continue where you left off" nudge.
 */
export type BoardFunnelStatus = {
  id: string;
  name: string;
  emoji: string;
  gradientClass: string;
  contentCount: number;
  hasAnalysis: boolean;
  hasRemix: boolean;
  hasCalendar: boolean;
  updatedAt: string;
};

export type ContinueWhereYouLeftOffData = {
  boards: BoardFunnelStatus[];
};

type BoardRow = {
  id: string;
  name: string;
  color: string | null;
  updated_at: string;
  board_content_items: { count: number }[];
};

/**
 * Determine the next best action label and href for a board based on its funnel status.
 */
export function getNextAction(
  board: BoardFunnelStatus,
): { label: string; href: string } {
  if (board.contentCount === 0) {
    return { label: "Thêm nội dung", href: `/boards/${board.id}` };
  }
  if (!board.hasAnalysis) {
    return { label: "Phân tích AI", href: `/boards/${board.id}` };
  }
  if (!board.hasRemix) {
    return { label: "Tạo remix", href: `/boards/${board.id}` };
  }
  if (!board.hasCalendar) {
    return { label: "Thêm vào lịch", href: "/calendar" };
  }
  return { label: "Mở board", href: `/boards/${board.id}` };
}

/**
 * Fetch boards with funnel status for the "Continue where you left off" nudge.
 * Returns the 3 most recently updated boards with activity data.
 * No new table — reuses existing tables only.
 */
export async function getContinueWhereYouLeftOff(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ data: ContinueWhereYouLeftOffData; error: string | null }> {
  // 1. Fetch boards sorted by updated_at DESC, limit 3
  const { data: boardRows, error: boardError } = await supabase
    .from("boards")
    .select("id, name, color, updated_at, board_content_items (count)")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(3);

  if (boardError) {
    return { data: { boards: [] }, error: boardError.message };
  }

  if (!boardRows || boardRows.length === 0) {
    return { data: { boards: [] }, error: null };
  }

  // 2. Get board IDs
  const boardIds = (boardRows as BoardRow[]).map((r) => r.id);

  // 3. Get content item IDs per board via board_content_items
  const { data: contentLinks, error: linkError } = await supabase
    .from("board_content_items")
    .select("board_id, content_item_id")
    .in("board_id", boardIds);

  if (linkError) {
    return { data: { boards: [] }, error: linkError.message };
  }

  // Group content IDs by board
  const contentByBoard: Record<string, string[]> = {};
  for (const link of contentLinks ?? []) {
    const record = link as { board_id: string; content_item_id: string };
    const list = contentByBoard[record.board_id];
    if (list) {
      list.push(record.content_item_id);
    } else {
      contentByBoard[record.board_id] = [record.content_item_id];
    }
  }

  // 4. Collect all unique content IDs for batch queries
  const allContentIds = Array.from(
    new Set(Object.values(contentByBoard).flat()),
  );

  // 5. Batch: get completed analyses for all content items
  const analysisContentIds = new Set<string>();
  if (allContentIds.length > 0) {
    const { data: analyses } = await supabase
      .from("content_analyses")
      .select("content_item_id")
      .in("content_item_id", allContentIds)
      .eq("status", "completed");

    for (const a of analyses ?? []) {
      const row = a as { content_item_id: string };
      analysisContentIds.add(row.content_item_id);
    }
  }

  // 6. Batch: get remixes (generated_outputs) for all content items
  const remixContentIds = new Set<string>();
  if (allContentIds.length > 0) {
    const { data: outputs } = await supabase
      .from("generated_outputs")
      .select("source_content_item_id")
      .in("source_content_item_id", allContentIds)
      .in("status", ["draft", "ready", "published"]);

    for (const o of outputs ?? []) {
      const row = o as { source_content_item_id: string };
      remixContentIds.add(row.source_content_item_id);
    }
  }

  // 7. Batch: get calendar items linked to content items
  const calendarContentIds = new Set<string>();
  if (allContentIds.length > 0) {
    const { data: calendarItems } = await supabase
      .from("content_calendar_items")
      .select("content_item_id")
      .in("content_item_id", allContentIds);

    for (const c of calendarItems ?? []) {
      const row = c as { content_item_id: string | null };
      if (row.content_item_id) {
        calendarContentIds.add(row.content_item_id);
      }
    }

    // Also check calendar items linked via generated_output_id
    const { data: genOutputs } = await supabase
      .from("generated_outputs")
      .select("id, source_content_item_id")
      .in("source_content_item_id", allContentIds);

    const outputIdByContentId: Record<string, string> = {};
    for (const o of genOutputs ?? []) {
      const row = o as { id: string; source_content_item_id: string };
      outputIdByContentId[row.source_content_item_id] = row.id;
    }

    const outputIds = Object.values(outputIdByContentId);
    if (outputIds.length > 0) {
      const { data: calByOutput } = await supabase
        .from("content_calendar_items")
        .select("generated_output_id")
        .in("generated_output_id", outputIds);

      const calendarOutputIds = new Set(
        (calByOutput ?? [])
          .map((c: { generated_output_id: string | null }) => c.generated_output_id)
          .filter((id: string | null): id is string => id !== null),
      );

      for (const [contentId, outputId] of Object.entries(outputIdByContentId)) {
        if (calendarOutputIds.has(outputId)) {
          calendarContentIds.add(contentId);
        }
      }
    }
  }

  // 8. Build board funnel statuses
  const boards: BoardFunnelStatus[] = (boardRows as BoardRow[]).map(
    (row, index) => {
      const contentItems = contentByBoard[row.id] ?? [];
      const hasAnalysis = contentItems.some((id) => analysisContentIds.has(id));
      const hasRemix = contentItems.some((id) => remixContentIds.has(id));
      const hasCalendar = contentItems.some((id) => calendarContentIds.has(id));

      return {
        id: row.id,
        name: row.name,
        emoji: getBoardEmoji(index),
        gradientClass: getBoardGradient(index, row.color),
        contentCount: row.board_content_items[0]?.count ?? 0,
        hasAnalysis,
        hasRemix,
        hasCalendar,
        updatedAt: row.updated_at,
      };
    },
  );

  return { data: { boards }, error: null };
}