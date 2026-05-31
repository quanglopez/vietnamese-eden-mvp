import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { PlatformType } from "@/types/content";

type LinkContentInput = {
  boardId: string;
  workspaceId: string;
  userId: string;
  title: string;
  platform: PlatformType;
  sourceUrl: string | null;
  rawContent: string | null;
};

export async function insertAndLinkContentItem(
  supabase: SupabaseClient<Database>,
  input: LinkContentInput,
): Promise<{ contentItemId: string } | { error: string }> {
  const { data: contentItem, error: contentError } = await supabase
    .from("content_items")
    .insert({
      workspace_id: input.workspaceId,
      title: input.title,
      raw_content: input.rawContent,
      platform: input.platform,
      source_url: input.sourceUrl,
      saved_by: input.userId,
    })
    .select("id")
    .single();

  if (contentError || !contentItem) {
    return { error: contentError?.message ?? "Không thể tạo nội dung." };
  }

  const { count } = await supabase
    .from("board_content_items")
    .select("id", { count: "exact", head: true })
    .eq("board_id", input.boardId);

  const sortOrder = count ?? 0;

  const { error: linkError } = await supabase.from("board_content_items").insert({
    board_id: input.boardId,
    content_item_id: contentItem.id,
    sort_order: sortOrder,
    added_by: input.userId,
  });

  if (linkError) {
    await supabase.from("content_items").delete().eq("id", contentItem.id);
    return { error: linkError.message };
  }

  return { contentItemId: contentItem.id };
}
