"use server";

import { revalidatePath } from "next/cache";

import { generateRemixVariants } from "@/lib/ai/client";
import { AiProviderError } from "@/lib/ai/errors";
import type { ActionResult } from "@/lib/boards/actions";
import { isValidUuid } from "@/lib/boards/utils";
import {
  DEFAULT_REMIX_VARIANT_COUNT,
  MAX_REMIX_VARIANT_COUNT,
  MIN_REMIX_VARIANT_COUNT,
} from "@/lib/remix/constants";
import { buildOutputTitle } from "@/lib/remix/metadata";
import { createClient } from "@/lib/supabase/server";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import type { RemixFormat, RemixTone } from "@/types/remix";

import { getVoiceProfileById } from "@/lib/voice/queries";

import { getContentAnalysisByItemId, getContentItemById } from "./analysis-queries";

const FORMAT_SET = new Set<RemixFormat>([
  "facebook_post",
  "linkedin_post",
  "tiktok_script",
  "youtube_shorts_script",
  "email",
]);

const TONE_SET = new Set<RemixTone>([
  "expert",
  "friendly",
  "sales",
  "storytelling",
  "controversial",
]);

export async function generateRemixAction(input: {
  contentItemId: string;
  format: RemixFormat;
  tone: RemixTone;
  variantCount?: number;
  voiceProfileId?: string | null;
}): Promise<ActionResult<{ outputIds: string[] }>> {
  const { contentItemId, format, tone, voiceProfileId } = input;
  const variantCount = input.variantCount ?? DEFAULT_REMIX_VARIANT_COUNT;

  if (!isValidUuid(contentItemId)) {
    return { success: false, error: "Content item không hợp lệ." };
  }
  if (!FORMAT_SET.has(format)) {
    return { success: false, error: "Format remix không hợp lệ." };
  }
  if (!TONE_SET.has(tone)) {
    return { success: false, error: "Tone remix không hợp lệ." };
  }
  if (variantCount < MIN_REMIX_VARIANT_COUNT || variantCount > MAX_REMIX_VARIANT_COUNT) {
    return {
      success: false,
      error: `Số biến thể phải từ ${MIN_REMIX_VARIANT_COUNT} đến ${MAX_REMIX_VARIANT_COUNT}.`,
    };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để tạo remix." };
  }

  const { item, error: itemError } = await getContentItemById(supabase, contentItemId);
  if (itemError) {
    return { success: false, error: itemError };
  }
  if (!item) {
    return { success: false, error: "Không tìm thấy nội dung hoặc bạn không có quyền truy cập." };
  }

  const rawContent = item.rawContent?.trim() ?? "";
  const { analysis, error: analysisError } = await getContentAnalysisByItemId(
    supabase,
    contentItemId,
  );
  if (analysisError) {
    return { success: false, error: analysisError };
  }

  if (!analysis) {
    if (rawContent.length === 0) {
      return {
        success: false,
        error:
          "Content này chỉ có URL. Hãy thêm nội dung thủ công và phân tích AI trước khi tạo remix.",
      };
    }
    return { success: false, error: "Hãy phân tích AI trước khi tạo remix." };
  }

  if (rawContent.length === 0) {
    return {
      success: false,
      error:
        "Content này chỉ có URL. Hãy thêm nội dung thủ công trước khi tạo remix.",
    };
  }

  let voiceProfile = null;
  if (voiceProfileId) {
    if (!isValidUuid(voiceProfileId)) {
      return { success: false, error: "Voice profile không hợp lệ." };
    }
    const { profile, error: voiceError } = await getVoiceProfileById(
      supabase,
      voiceProfileId,
      user.id,
    );
    if (voiceError) {
      return { success: false, error: voiceError };
    }
    if (!profile) {
      return { success: false, error: "Không tìm thấy voice profile." };
    }
    voiceProfile = profile;
  }

  let remixResult;
  try {
    remixResult = await generateRemixVariants({
      title: item.title,
      platform: getPlatformLabel(item.platform),
      rawContent,
      format,
      tone,
      variantCount,
      analysis,
      voiceProfile,
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: error instanceof Error ? error.message : "Tạo remix thất bại.",
    };
  }

  const rows = remixResult.variants.map((variant, index) => ({
    workspace_id: item.workspaceId,
    source_content_item_id: contentItemId,
    voice_profile_id: voiceProfile?.id ?? null,
    title: buildOutputTitle({
      format,
      tone,
      variantIndex: index + 1,
      aiTitle: variant.title,
    }),
    content: variant.content,
    status: "draft" as const,
    created_by: user.id,
  }));

  const { data, error } = await supabase.from("generated_outputs").insert(rows).select("id");

  if (error || !data?.length) {
    return { success: false, error: error?.message ?? "Không thể lưu remix." };
  }

  revalidateRemixPaths(contentItemId, item.boardId);
  return { success: true, data: { outputIds: data.map((row) => row.id) } };
}

function revalidateRemixPaths(contentItemId: string, boardId: string | null) {
  revalidatePath(`/remix/${contentItemId}`);
  revalidatePath(`/breakdown/${contentItemId}`);
  if (boardId) {
    revalidatePath(`/boards/${boardId}`);
  }
}
