"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import { assignTagToContent } from "@/lib/content/tag-actions";
import { createClient } from "@/lib/supabase/server";

function validateIds(ids: string[]): string[] | null {
  const unique = Array.from(new Set(ids));
  if (unique.length === 0) {
    return null;
  }
  if (!unique.every((id) => isValidUuid(id))) {
    return null;
  }
  return unique;
}

export async function bulkAddTagAction(input: {
  contentItemIds: string[];
  tagId: string;
  boardId: string;
}): Promise<ActionResult<{ updated: number; failed: number }>> {
  const contentItemIds = validateIds(input.contentItemIds);
  if (!contentItemIds || !isValidUuid(input.tagId) || !isValidUuid(input.boardId)) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  let updated = 0;
  let failed = 0;
  for (const contentItemId of contentItemIds) {
    const result = await assignTagToContent({
      contentItemId,
      tagId: input.tagId,
    });
    if (result.success) {
      updated += 1;
    } else {
      failed += 1;
    }
  }

  revalidatePath(`/boards/${input.boardId}`);
  if (failed > 0 && updated === 0) {
    return { success: false, error: "Không thể gắn tag cho các mục đã chọn." };
  }
  return { success: true, data: { updated, failed } };
}

export async function bulkUnlinkFromBoardAction(input: {
  contentItemIds: string[];
  boardId: string;
}): Promise<ActionResult<{ removed: number }>> {
  const contentItemIds = validateIds(input.contentItemIds);
  if (!contentItemIds || !isValidUuid(input.boardId)) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data, error } = await supabase
    .from("board_content_items")
    .delete()
    .eq("board_id", input.boardId)
    .in("content_item_id", contentItemIds)
    .select("id");

  if (error) {
    return { success: false, error: error.message };
  }

  const removed = data?.length ?? 0;
  revalidatePath(`/boards/${input.boardId}`);
  revalidatePath("/boards");
  return { success: true, data: { removed } };
}

export async function bulkMoveToBoardAction(input: {
  contentItemIds: string[];
  sourceBoardId: string;
  targetBoardId: string;
}): Promise<ActionResult<{ moved: number }>> {
  const contentItemIds = validateIds(input.contentItemIds);
  if (
    !contentItemIds ||
    !isValidUuid(input.sourceBoardId) ||
    !isValidUuid(input.targetBoardId)
  ) {
    return { success: false, error: "Dữ liệu không hợp lệ." };
  }
  if (input.sourceBoardId === input.targetBoardId) {
    return { success: false, error: "Bảng đích phải khác bảng hiện tại." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data: boards, error: boardsError } = await supabase
    .from("boards")
    .select("id, workspace_id")
    .in("id", [input.sourceBoardId, input.targetBoardId]);

  if (boardsError || !boards || boards.length !== 2) {
    return { success: false, error: "Không tìm thấy bảng nguồn hoặc đích." };
  }

  const workspaceIds = new Set(boards.map((b) => b.workspace_id));
  if (workspaceIds.size !== 1) {
    return { success: false, error: "Hai bảng phải thuộc cùng workspace." };
  }

  const { count: targetCount } = await supabase
    .from("board_content_items")
    .select("id", { count: "exact", head: true })
    .eq("board_id", input.targetBoardId);

  const { data: existingOnTarget, error: existingError } = await supabase
    .from("board_content_items")
    .select("content_item_id")
    .eq("board_id", input.targetBoardId)
    .in("content_item_id", contentItemIds);

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  const alreadyOnTarget = new Set(
    (existingOnTarget ?? []).map((row) => row.content_item_id),
  );
  const newlyLinkedIds = contentItemIds.filter((id) => !alreadyOnTarget.has(id));

  const baseSort = targetCount ?? 0;
  const rows = contentItemIds.map((contentItemId, index) => ({
    board_id: input.targetBoardId,
    content_item_id: contentItemId,
    sort_order: baseSort + index,
    added_by: user.id,
  }));

  const { error: insertError } = await supabase.from("board_content_items").upsert(rows, {
    onConflict: "board_id,content_item_id",
    ignoreDuplicates: true,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("board_content_items")
    .delete()
    .eq("board_id", input.sourceBoardId)
    .in("content_item_id", contentItemIds)
    .select("id");

  if (deleteError) {
    if (newlyLinkedIds.length > 0) {
      const { error: rollbackError } = await supabase
        .from("board_content_items")
        .delete()
        .eq("board_id", input.targetBoardId)
        .in("content_item_id", newlyLinkedIds);

      if (rollbackError) {
        return {
          success: false,
          error:
            "Chuyển board thất bại. Một số mục có thể vẫn xuất hiện ở cả hai bảng — vui lòng kiểm tra thủ công.",
        };
      }
    }

    return {
      success: false,
      error:
        newlyLinkedIds.length > 0
          ? "Chuyển board thất bại. Đã hoàn tác liên kết mới ở bảng đích."
          : "Chuyển board thất bại. Không thể gỡ các mục khỏi bảng nguồn.",
    };
  }

  const moved = deleted?.length ?? 0;
  revalidatePath(`/boards/${input.sourceBoardId}`);
  revalidatePath(`/boards/${input.targetBoardId}`);
  revalidatePath("/boards");
  return { success: true, data: { moved } };
}
