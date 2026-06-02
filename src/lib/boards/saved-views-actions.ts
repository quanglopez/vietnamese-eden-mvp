"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import { createClient } from "@/lib/supabase/server";
import type { SavedBoardViewPlatform } from "@/types/boards";

function normalizeName(name: string): string {
  return name.trim();
}

function normalizeSearchQuery(value: string | null | undefined): string | null {
  const q = value?.trim() ?? "";
  return q.length > 0 ? q : null;
}

function normalizePlatformFilters(
  value: SavedBoardViewPlatform[] | null | undefined,
): SavedBoardViewPlatform[] | null {
  if (!value || value.length === 0) {
    return null;
  }
  const unique = Array.from(new Set(value));
  return unique.length > 0 ? unique : null;
}

function normalizeTagFilters(value: string[] | null | undefined): string[] | null {
  if (!value || value.length === 0) {
    return null;
  }
  const unique = Array.from(new Set(value));
  return unique.length > 0 ? unique : null;
}

export async function createSavedViewAction(input: {
  boardId: string;
  workspaceId: string;
  name: string;
  searchQuery?: string | null;
  platformFilters?: SavedBoardViewPlatform[] | null;
  tagFilters?: string[] | null;
  sortOrder?: number;
}): Promise<ActionResult<{ id: string }>> {
  if (!isValidUuid(input.boardId) || !isValidUuid(input.workspaceId)) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }

  const name = normalizeName(input.name);
  if (name.length < 1) {
    return { success: false, error: "Tên view không được để trống." };
  }
  if (name.length > 80) {
    return { success: false, error: "Tên view tối đa 80 ký tự." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data, error } = await supabase
    .from("board_saved_views")
    .insert({
      board_id: input.boardId,
      workspace_id: input.workspaceId,
      created_by: user.id,
      name,
      search_query: normalizeSearchQuery(input.searchQuery),
      platform_filters: normalizePlatformFilters(input.platformFilters),
      tag_filters: normalizeTagFilters(input.tagFilters),
      sort_order: input.sortOrder ?? 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    const message =
      error?.message?.toLowerCase().includes("duplicate") ||
      error?.message?.toLowerCase().includes("unique")
        ? "Tên view đã tồn tại trong board này. Hãy chọn tên khác."
        : error?.message ?? "Không thể lưu view.";
    return { success: false, error: message };
  }

  revalidatePath(`/boards/${input.boardId}`);
  return { success: true, data: { id: data.id } };
}

export async function deleteSavedViewAction(input: {
  boardId: string;
  viewId: string;
}): Promise<ActionResult<{ id: string }>> {
  if (!isValidUuid(input.boardId) || !isValidUuid(input.viewId)) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { error } = await supabase
    .from("board_saved_views")
    .delete()
    .eq("id", input.viewId)
    .eq("board_id", input.boardId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/boards/${input.boardId}`);
  return { success: true, data: { id: input.viewId } };
}

