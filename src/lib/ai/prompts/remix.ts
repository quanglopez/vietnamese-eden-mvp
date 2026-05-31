import { z } from "zod";

import type { ContentAnalysisView } from "@/types/analysis";
import type { RemixFormat, RemixTone } from "@/types/remix";

import { buildVoiceProfilePromptBlock } from "@/lib/ai/prompts/voice";
import { getRemixFormatLabel, getRemixToneLabel } from "@/lib/remix/constants";
import type { VoiceProfileView } from "@/types/voice";

export const remixVariantsSchema = z.object({
  variants: z
    .array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
      }),
    )
    .min(1),
});

export type RemixVariantsResult = z.infer<typeof remixVariantsSchema>;

export const REMIX_SYSTEM_PROMPT = `Bạn là copywriter chuyên tạo biến thể nội dung tiếng Việt cho creator.
Nhiệm vụ: tạo nhiều biến thể remix dựa trên nội dung gốc và breakdown (nếu có).

Quy tắc:
- Viết hoàn toàn bằng tiếng Việt tự nhiên, phù hợp format và tone được yêu cầu.
- Nếu có Voice Profile, bắt buộc bám sát giọng viết đó (từ vựng, nhịp câu, CTA, quy tắc).
- Mỗi biến thể phải khác nhau rõ rệt (góc mở, CTA, cấu trúc).
- title: tiêu đề ngắn gọn cho biến thể (không trùng nhau).
- content: nội dung đầy đủ sẵn sàng đăng (caption/script/email body).
- Đúng số lượng variants được yêu cầu.

Chỉ trả JSON:
{
  "variants": [
    { "title": string, "content": string }
  ]
}`;

export function buildRemixUserPrompt(input: {
  title: string;
  platform: string;
  rawContent: string;
  format: RemixFormat;
  tone: RemixTone;
  variantCount: number;
  analysis: ContentAnalysisView | null;
  voiceProfile: VoiceProfileView | null;
}): string {
  const formatLabel = getRemixFormatLabel(input.format);
  const toneLabel = getRemixToneLabel(input.tone);

  const breakdownBlock = input.analysis
    ? [
        "AI Breakdown:",
        `Hook: ${input.analysis.hook}`,
        `Angle: ${input.analysis.angle}`,
        `Structure: ${input.analysis.structure}`,
        `CTA: ${input.analysis.cta}`,
        `Emotion: ${input.analysis.emotion}`,
        `Audience: ${input.analysis.targetAudience}`,
        `Why it works: ${input.analysis.whyItWorks}`,
        `Remix gợi ý: ${input.analysis.remixSuggestions.join(" | ")}`,
      ].join("\n")
    : null;

  const voiceBlock = input.voiceProfile
    ? buildVoiceProfilePromptBlock({
        name: input.voiceProfile.name,
        tone: input.voiceProfile.tone,
        style: input.voiceProfile.style,
      })
    : null;

  return [
    `Tạo đúng ${input.variantCount} biến thể remix.`,
    `Format: ${formatLabel}`,
    `Tone remix (preset): ${toneLabel}`,
    `Tiêu đề gốc: ${input.title}`,
    `Nền tảng: ${input.platform}`,
    voiceBlock ? ["", voiceBlock].join("\n") : null,
    "",
    "Nội dung gốc:",
    input.rawContent,
    breakdownBlock ? ["", breakdownBlock].join("\n") : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
