import type { SupabaseClient } from "@supabase/supabase-js";

import type { BoardSavedView, SavedBoardViewPlatform } from "@/types/boards";
import type { Database } from "@/types/database";

type SavedViewRow = Database["public"]["Tables"]["board_saved_views"]["Row"];

function mapSavedView(row: SavedViewRow): BoardSavedView {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    boardId: row.board_id,
    createdBy: row.created_by,
    name: row.name,
    searchQuery: row.search_query,
    platformFilters: (row.platform_filters ?? null) as SavedBoardViewPlatform[] | null,
    tagFilters: row.tag_filters ?? null,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getSavedViewsForBoard(
  supabase: SupabaseClient<Database>,
  boardId: string,
): Promise<{ views: BoardSavedView[]; error: string | null }> {
  const { data, error } = await supabase
    .from("board_saved_views")
    .select(
      "id, workspace_id, board_id, created_by, name, search_query, platform_filters, tag_filters, sort_order, created_at, updated_at",
    )
    .eq("board_id", boardId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { views: [], error: error.message };
  }

  const rows = (data ?? []) as SavedViewRow[];
  return { views: rows.map((row) => mapSavedView(row)), error: null };
}

