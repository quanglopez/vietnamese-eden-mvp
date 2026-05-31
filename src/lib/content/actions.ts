"use server";

import { revalidatePath } from "next/cache";

import { getBoardById } from "@/lib/boards/queries";
import type { ActionResult } from "@/lib/boards/actions";
import { createClient } from "@/lib/supabase/server";
import {
  addContentTextSchema,
  type AddContentTextInput,
} from "@/lib/validations/content";

export async function addContentTextAction(
  input: AddContentTextInput,
): Promise<ActionResult<{ contentItemId: string }>> {
  const parsed = addContentTextSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const { boardId, title, rawContent, platform, sourceUrl } = parsed.data;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để thêm nội dung." };
  }

  const { board, error: boardError } = await getBoardById(supabase, boardId);
  if (boardError) {
    return { success: false, error: boardError };
  }
  if (!board) {
    return {
      success: false,
      error: "Không tìm thấy bảng hoặc bạn không có quyền truy cập.",
    };
  }

  const { data: contentItem, error: contentError } = await supabase
    .from("content_items")
    .insert({
      workspace_id: board.workspaceId,
      title,
      raw_content: rawContent,
      platform: platform ?? "other",
      source_url: sourceUrl?.trim() || null,
      saved_by: user.id,
    })
    .select("id")
    .single();

  if (contentError || !contentItem) {
    return {
      success: false,
      error: contentError?.message ?? "Không thể tạo nội dung.",
    };
  }

  const { count } = await supabase
    .from("board_content_items")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  const sortOrder = count ?? 0;

  const { error: linkError } = await supabase.from("board_content_items").insert({
    board_id: boardId,
    content_item_id: contentItem.id,
    sort_order: sortOrder,
    added_by: user.id,
  });

  if (linkError) {
    await supabase.from("content_items").delete().eq("id", contentItem.id);
    return { success: false, error: linkError.message };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
  revalidatePath("/dashboard");

  return { success: true, data: { contentItemId: contentItem.id } };
}
