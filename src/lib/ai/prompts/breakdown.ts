import { z } from "zod";

export const breakdownAnalysisSchema = z.object({
  hook: z.string().min(1),
  angle: z.string().min(1),
  structure: z.string().min(1),
  cta: z.string().min(1),
  emotion: z.string().min(1),
  target_audience: z.string().min(1),
  why_it_works: z.string().min(1),
  remix_suggestions: z.array(z.string().min(1)).min(1),
});

export type BreakdownAnalysisResult = z.infer<typeof breakdownAnalysisSchema>;

export const BREAKDOWN_SYSTEM_PROMPT = `Bạn là chuyên gia phân tích nội dung viral cho creator Việt Nam.
Nhiệm vụ: phân tích caption/script tiếng Việt và trả về JSON thuần (không markdown, không giải thích thêm).

Quy tắc:
- Viết **100% tiếng Việt** (có thể dùng thuật ngữ Anh thông dụng: AI, marketing, video, content).
- Không dùng từ/câu tiếng Bồ Đào Nha, Tây Ban Nha, Pháp hoặc ngôn ngữ Latin khác.
- Súc tích, thực chiến.
- Hook: 0–3 giây mở đầu — trích hoặc diễn giải câu mở.
- Angle: góc nhìn / positioning.
- Structure: dàn ý từng phần (numbered list OK).
- CTA: l lời kêu gọi hành động.
- emotion: cảm xúc chính kích hoạt.
- target_audience: đối tượng mục tiêu cụ thể.
- why_it_works: vì sao công thức này hiệu quả với audience Việt.
- remix_suggestions: 2–4 gợi ý remix ngắn, actionable.

Chỉ trả JSON đúng schema:
{
  "hook": string,
  "angle": string,
  "structure": string,
  "cta": string,
  "emotion": string,
  "target_audience": string,
  "why_it_works": string,
  "remix_suggestions": string[]
}`;

/**
 * Nối vào user prompt khi retry sau khi phát hiện rò rỉ ngôn ngữ (ALE-153).
 */
export const BREAKDOWN_VIETNAMESE_ONLY_REPAIR_SUFFIX = `

QUAN TRỌNG — lần trước output có từ/ký tự không phải tiếng Việt:
- Viết lại **100% tiếng Việt chuẩn**. Chỉ được dùng thuật ngữ Anh thông dụng (AI, marketing, video, content, hook, CTA).
- Không dùng từ tiếng Bồ Đào Nha, Tây Ban Nha, Pháp hoặc ngôn ngữ Latin khác (vd. pontos, porque, muy, cette).
- Nếu không chắc cách diễn đạt, chọn cụm tiếng Việt khác — không trộn ngôn ngữ nước ngoài.`;

export function buildBreakdownUserPrompt(input: {
  title: string;
  platform: string;
  rawContent: string;
  sourceUrl?: string | null;
  vietnameseOnlyRepair?: boolean;
}): string {
  const base = [
    `Tiêu đề: ${input.title}`,
    `Nền tảng: ${input.platform}`,
    input.sourceUrl ? `Link nguồn: ${input.sourceUrl}` : null,
    "",
    "Nội dung cần phân tích:",
    input.rawContent,
  ]
    .filter((line) => line !== null)
    .join("\n");

  return input.vietnameseOnlyRepair
    ? `${base}${BREAKDOWN_VIETNAMESE_ONLY_REPAIR_SUFFIX}`
    : base;
}
