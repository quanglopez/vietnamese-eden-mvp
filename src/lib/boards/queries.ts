import type { SupabaseClient } from "@supabase/supabase-js";

import {
  getBoardEmoji,
  getBoardGradient,
} from "@/lib/boards/constants";
import type { Database } from "@/types/database";
import type { BoardContentItem, PlatformType } from "@/types/content";
import type { BoardDetail, BoardListItem } from "@/types/boards";

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

type BoardDetailRow = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  board_content_items: { count: number }[];
};

type BoardContentJoinRow = {
  sort_order: number;
  added_at: string;
  content_items: {
    id: string;
    title: string;
    platform: PlatformType;
    source_url: string | null;
    raw_content: string | null;
    author_name: string | null;
    saved_at: string;
  } | null;
};

export async function getBoardById(
  supabase: SupabaseClient<Database>,
  boardId: string,
): Promise<{ board: BoardDetail | null; error: string | null }> {
  const { data, error } = await supabase
    .from("boards")
    .select(
      `
      id,
      workspace_id,
      name,
      description,
      color,
      sort_order,
      created_at,
      updated_at,
      board_content_items (count)
    `,
    )
    .eq("id", boardId)
    .maybeSingle();

  if (error) {
    return { board: null, error: error.message };
  }

  if (!data) {
    return { board: null, error: null };
  }

  const row = data as BoardDetailRow;

  return {
    board: {
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      description: row.description,
      gradientClass: getBoardGradient(row.sort_order, row.color),
      emoji: getBoardEmoji(row.sort_order),
      contentCount: row.board_content_items[0]?.count ?? 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
    error: null,
  };
}

export async function listBoardContentItems(
  supabase: SupabaseClient<Database>,
  boardId: string,
): Promise<{ items: BoardContentItem[]; error: string | null }> {
  const { data, error } = await supabase
    .from("board_content_items")
    .select(
      `
      sort_order,
      added_at,
      content_items (
        id,
        title,
        platform,
        source_url,
        raw_content,
        author_name,
        saved_at
      )
    `,
    )
    .eq("board_id", boardId)
    .order("sort_order", { ascending: true })
    .order("added_at", { ascending: false });

  if (error) {
    return { items: [], error: error.message };
  }

  const rows = (data ?? []) as BoardContentJoinRow[];

  const items: BoardContentItem[] = rows.flatMap((row) => {
    const content = row.content_items;
    if (!content) {
      return [];
    }
    return [
      {
        id: content.id,
        title: content.title,
        platform: content.platform,
        sourceUrl: content.source_url,
        rawContent: content.raw_content,
        authorName: content.author_name,
        savedAt: content.saved_at,
        sortOrder: row.sort_order,
        addedAt: row.added_at,
      },
    ];
  });

  return { items, error: null };
}
