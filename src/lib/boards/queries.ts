import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getBoardEmoji,
  getBoardGradient,
} from "@/lib/boards/constants";
import type { Database } from "@/types/database";
import type { BoardListItem } from "@/types/boards";

type BoardQueryRow = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  updated_at: string;
  board_content_items: { count: number }[];
};

export async function listBoardsForWorkspace(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ boards: BoardListItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("boards")
    .select(
      `
      id,
      name,
      description,
      color,
      updated_at,
      board_content_items (count)
    `,
    )
    .eq("workspace_id", workspaceId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    return { boards: [], error: error.message };
  }

  const rows = (data ?? []) as BoardQueryRow[];

  const boards: BoardListItem[] = rows.map((row, index) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    contentCount: row.board_content_items[0]?.count ?? 0,
    updatedAt: row.updated_at,
    gradientClass: getBoardGradient(index, row.color),
    emoji: getBoardEmoji(index),
  }));

  return { boards, error: null };
}
