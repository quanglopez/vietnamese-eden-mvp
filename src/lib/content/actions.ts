"use server";

import { revalidatePath } from "next/cache";

import { getBoardById } from "@/lib/boards/queries";
import type { ActionResult } from "@/lib/boards/actions";
import { enrichContentItemFromUrl } from "@/lib/content/enrich-url-content";
import { insertAndLinkContentItem } from "@/lib/content/link-content";
import {
  detectPlatformFromUrl,
  generateTitleFromUrl,
  normalizeSourceUrl,
} from "@/lib/content/platform-detect";
import { createClient } from "@/lib/supabase/server";
import {
  addContentTextSchema,
  addContentUrlSchema,
  type AddContentTextInput,
  type AddContentUrlInput,
} from "@/lib/validations/content";

function revalidateBoardPaths(boardId: string) {
  revalidatePath("/boards");
  revalidatePath(`/boards/${boardId}`);
  revalidatePath("/dashboard");
}

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

  const result = await insertAndLinkContentItem(supabase, {
    boardId,
    workspaceId: board.workspaceId,
    userId: user.id,
    title,
    rawContent,
    platform: platform ?? "other",
    sourceUrl: sourceUrl?.trim() || null,
  });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidateBoardPaths(boardId);
  return { success: true, data: { contentItemId: result.contentItemId } };
}

export async function addContentUrlAction(
  input: AddContentUrlInput,
): Promise<
  ActionResult<{
    contentItemId: string;
    platformLabel: string;
    pendingExtraction: true;
  }>
> {
  const parsed = addContentUrlSchema.safeParse(input);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return {
      success: false,
      error: firstIssue?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  const { boardId, title: titleInput } = parsed.data;
  const sourceUrl = normalizeSourceUrl(parsed.data.sourceUrl);
  const detected = detectPlatformFromUrl(sourceUrl);
  const title = titleInput?.trim() || generateTitleFromUrl(sourceUrl);

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

  const result = await insertAndLinkContentItem(supabase, {
    boardId,
    workspaceId: board.workspaceId,
    userId: user.id,
    title,
    rawContent: null,
    platform: detected.platform,
    sourceUrl,
  });

  if ("error" in result) {
    return { success: false, error: result.error };
  }

  revalidateBoardPaths(boardId);

  await enrichContentItemFromUrl(supabase, result.contentItemId);
  revalidateBoardPaths(boardId);

  return {
    success: true,
    data: {
      contentItemId: result.contentItemId,
      platformLabel: detected.label,
      pendingExtraction: true,
    },
  };
}
