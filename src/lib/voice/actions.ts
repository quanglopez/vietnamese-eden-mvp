"use server";

import { revalidatePath } from "next/cache";

import { analyzeVoiceProfile } from "@/lib/ai/client";
import { AiProviderError } from "@/lib/ai/errors";
import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import {
  countSamplePosts,
  MAX_VOICE_SAMPLE_CHARS,
  MIN_VOICE_SAMPLE_CHARS,
} from "@/lib/voice/constants";
import { buildStyleNotesPayload } from "@/lib/voice/style-notes";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export async function createVoiceProfileAction(input: {
  name: string;
  sampleWritings: string;
  description?: string;
  setAsDefault?: boolean;
}): Promise<ActionResult<{ profileId: string }>> {
  const name = input.name.trim();
  const sampleWritings = input.sampleWritings.trim();
  const description = input.description?.trim() ?? "";

  if (name.length < 2) {
    return { success: false, error: "Tên profile phải có ít nhất 2 ký tự." };
  }
  if (sampleWritings.length < MIN_VOICE_SAMPLE_CHARS) {
    return {
      success: false,
      error: `Mẫu viết phải có ít nhất ${MIN_VOICE_SAMPLE_CHARS} ký tự (hiện ${sampleWritings.length}).`,
    };
  }
  if (sampleWritings.length > MAX_VOICE_SAMPLE_CHARS) {
    return {
      success: false,
      error: `Mẫu viết quá dài (tối đa ${MAX_VOICE_SAMPLE_CHARS} ký tự).`,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để tạo voice profile." };
  }

  const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);
  if (workspaceError) {
    return { success: false, error: workspaceError };
  }
  if (!workspace) {
    return { success: false, error: "Không tìm thấy workspace. Hãy tạo workspace trước." };
  }

  let analysis;
  try {
    analysis = await analyzeVoiceProfile({
      profileName: name,
      sampleWritings,
      description: description || null,
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Phân tích giọng viết thất bại.",
    };
  }

  const { count: existingCount } = await supabase
    .from("voice_profiles")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id);

  const shouldDefault = input.setAsDefault === true || (existingCount ?? 0) === 0;

  if (shouldDefault) {
    await supabase
      .from("voice_profiles")
      .update({ is_default: false })
      .eq("workspace_id", workspace.id)
      .eq("user_id", user.id)
      .eq("is_default", true);
  }

  const styleNotes = buildStyleNotesPayload(
    {
      vocabulary: analysis.vocabulary,
      sentence_style: analysis.sentence_style,
      cta_style: analysis.cta_style,
      content_structure: analysis.content_structure,
      common_openings: analysis.common_openings,
      common_endings: analysis.common_endings,
      banned_phrases: analysis.banned_phrases,
      writing_rules: analysis.writing_rules,
    },
    description || null,
  );

  const { data, error } = await supabase
    .from("voice_profiles")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      name,
      tone: analysis.tone,
      style_notes: styleNotes,
      sample_count: countSamplePosts(sampleWritings),
      is_default: shouldDefault,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể lưu voice profile." };
  }

  revalidatePath("/voice");
  revalidatePath("/remix", "layout");
  return { success: true, data: { profileId: data.id } };
}

export async function setDefaultVoiceProfileAction(
  profileId: string,
): Promise<ActionResult<{ profileId: string }>> {
  if (!isValidUuid(profileId)) {
    return { success: false, error: "Voice profile không hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data: profile, error: fetchError } = await supabase
    .from("voice_profiles")
    .select("id, workspace_id, user_id")
    .eq("id", profileId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) {
    return { success: false, error: fetchError.message };
  }
  if (!profile) {
    return { success: false, error: "Không tìm thấy voice profile." };
  }

  await supabase
    .from("voice_profiles")
    .update({ is_default: false })
    .eq("workspace_id", profile.workspace_id)
    .eq("user_id", user.id)
    .eq("is_default", true);

  const { error } = await supabase
    .from("voice_profiles")
    .update({ is_default: true })
    .eq("id", profileId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/voice");
  revalidatePath("/remix", "layout");
  return { success: true, data: { profileId } };
}
