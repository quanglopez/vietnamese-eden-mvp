"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateContentTranscriptAction(
  contentItemId: string,
  transcript: string,
): Promise<{ success: boolean; error: string | null }> {
  if (!contentItemId || !transcript.trim()) {
    return { success: false, error: "Thiếu nội dung transcript." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  // Get current raw_content
  const { data: item, error: fetchError } = await supabase
    .from("content_items")
    .select("raw_content, id")
    .eq("id", contentItemId)
    .single();

  if (fetchError || !item) {
    return { success: false, error: "Không tìm thấy nội dung." };
  }

  const transcriptHeader = "[Transcript thủ công — do người dùng cung cấp để phân tích sâu hơn.]";
  const existingContent = item.raw_content ?? "";
  
  // Append transcript to existing content
  const updatedContent = [
    existingContent,
    "",
    transcriptHeader,
    "",
    transcript.trim(),
  ]
    .filter(Boolean)
    .join("\n")
    .trim();

  const { error: updateError } = await supabase
    .from("content_items")
    .update({ raw_content: updatedContent })
    .eq("id", contentItemId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  revalidatePath(`/breakdown/${contentItemId}`);
  return { success: true, error: null };
}
