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

export const REMIX_FORMAT_GUIDANCE: Record<RemixFormat, string> = {
  tiktok_script:
    "Format: TikTok script ngắn, nói được, 15-60 giây. Mỗi variant phải khác hook và flow. Tránh văn viết dài.",
  youtube_shorts_script:
    "Format: YouTube Shorts script, 30-90 giây. Hook mạnh trong 3 giây đầu. CTA rõ ràng ở cuối.",
  facebook_post:
    "Format: Facebook post, xuống dòng dễ đọc, emoji tự nhiên, không wall-of-text. Hook ở dòng đầu.",
  linkedin_post:
    "Format: LinkedIn post, professional nhưng không khô khan. Storytelling hoặc insight. Xuống dòng mỗi 1-2 câu.",
  email:
    "Format: Email, có subject line, greeting ngắn, body scannable, CTA rõ. Professional but warm.",
};

export const REMIX_SYSTEM_PROMPT = `Bạn là copywriter chuyên tạo biến thể nội dung tiếng Việt cho creator.
Nhiệm vụ: tạo nhiều biến thể remix dựa trên nội dung gốc và breakdown (nếu có).

QUY TẮC DIVERSITY (bắt buộc):
- Mỗi biến thể phải khác nhau ở ít nhất 2 trong 4 yếu tố: Angle/góc tiếp cận, Opening/hook mở bài, CTA/kêu gọi hành động, Structure/cấu trúc.
- Mỗi biến thể phải có angle khác nhau rõ rệt. KHÔNG được lặp lại cùng một góc nhìn.
  Ví dụ angle: storytelling, listicle tips, controversial opinion, before/after, myth-busting, personal confession, data-driven insight.
- Mỗi biến thể phải có hook/opening khác nhau. KHÔNG được dùng cùng một câu mở đầu.
  Ví dụ opening: câu hỏi, fact shocking, story opener, quote, direct address ("Mình từng…"), pattern interrupt.
- Mỗi biến thể phải có CTA khác nhau. KHÔNG được lặp "comment ngay" hoặc cùng một lời kêu gọi ở mọi variant.
  Ví dụ CTA: comment, share, click link, save, tag friend, reply với keyword, follow, DM.
- Mỗi biến thể phải có cấu trúc khác nhau: ngắn gọn (1-2 câu) vs chi tiết (3-5 câu có xuống dòng) vs list vs story có intro-body-cta.
- Các title phải phản ánh angle riêng, không generic như "Biến thể 1", "Bản 2", "Variant A".

QUY TẮC TIẾNG VIỆT TỰ NHIÊN (bắt buộc):
- Viết như người Việt nói chuyện hàng ngày — không sáo rỗng, không dùng từ hoa mỹ quá mức.
- Tránh cụm từ "dịch máy" như: "hãy để tôi nói cho bạn biết", "trong thời đại ngày nay", "điều quan trọng là" ở mọi variant.
- Dùng từ lóng, emoji, dấu chấm than một cách tự nhiên nếu phù hợp tone — không gượng ép.
- Nếu format là TikTok script: viết ngắn, nói được, dùng từ đời thường. Tránh văn viết dài dòng.
- Nếu format là Facebook/LinkedIn: giữ xuống dòng dễ đọc, mỗi đoạn 1-2 câu, dùng bullet hoặc number nếu phù hợp.
- Nếu có Voice Profile: bám sát giọng nhưng KHÔNG copy-paste y nguyên từ sample. Học style rồi viết mới.

QUY TẮC NGÔN NGỮ TUYỆT ĐỐI:
- Nội dung viết **100% tiếng Việt chuẩn**. Không có ký tự Trung Quốc, Nhật, Hàn, hay glyph Unicode lạ nào.
- Không dùng từ Hán Việt không phổ biến hoặc ký tự CJK (U+4E00–U+9FFF) bên ngoài Emoji.
- Nếu không biết cách diễn đạt bằng tiếng Việt tự nhiên, viết lại cách khác — không trộn tiếng Hoa.

Quy tắc nội dung:
- Viết hoàn toàn bằng tiếng Việt tự nhiên, phù hợp format và tone được yêu cầu.
- Nếu có Voice Profile, bắt buộc bám sát giọng viết đó (từ vựng, nhịp câu, CTA, quy tắc).
- title: tiêu đề ngắn gọn mô tả angle (không trùng nhau).
- content: nội dung đầy đủ sẵn sàng đăng (caption/script/email body).
- Đúng số lượng variants được yêu cầu.

Quy tắc JSON (bắt buộc):
- Chỉ trả MỘT JSON object hợp lệ, bắt đầu bằng { và kết thúc bằng }.
- KHÔNG markdown, KHÔNG code fence (\`\`\`), KHÔNG giải thích trước/sau JSON.
- Trong chuỗi JSON: escape newline thành \\n, escape dấu ngoặc kép thành \\".
- Không trailing comma sau phần tử cuối trong mảng/object.

Schema:
{
  "variants": [
    { "title": "string", "content": "string" }
  ]
}`;

export const REMIX_JSON_REPAIR_USER_SUFFIX = `

QUAN TRỌNG — sửa lỗi lần trước:
- Chỉ trả một JSON object duy nhất (không markdown, không code fence, không text thừa).
- Đúng schema {"variants":[{"title":"...","content":"..."}]} với đủ số biến thể yêu cầu.
- Mọi chuỗi phải là JSON hợp lệ (escape ký tự đặc biệt).`;

export const REMIX_CJK_REPAIR_USER_SUFFIX = `

QUAN TRỌNG — lần trước có ký tự Trung/Nhật/Hàn trong output:
- Viết lại **100% tiếng Việt chuẩn**. Không ký tự CJK (U+4E00–U+9FFF), Hiragana, Katakana, Hangul.
- Nếu không biết cách diễn đạt, chọn từ/cụm tiếng Việt khác — không trộn tiếng Hoa.`;

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
  const formatHint = REMIX_FORMAT_GUIDANCE[input.format];

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
    formatHint ? `📐 ${formatHint}` : null,
    `Tone remix (preset): ${toneLabel}`,
    `Tiêu đề gốc: ${input.title}`,
    `Nền tảng: ${input.platform}`,
    "",
    "Yêu cầu diversity: mỗi variant khác angle, hook mở bài, CTA và cấu trúc. Title mô tả angle, không generic.",
    "Nhắc lại quy tắc: output 100% tiếng Việt, không ký tự Trung Quốc/Nhật/Hàn.",
    voiceBlock ? ["", voiceBlock].join("\n") : null,
    "",
    "Nội dung gốc:",
    input.rawContent,
    breakdownBlock ? ["", breakdownBlock].join("\n") : null,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/**
 * Manual test checklist (ALE-144) — run on production or local with real AI keys:
 *
 * Setup: paste text content (≥50 chars) → AI Breakdown → Remix page
 *
 * 5 variants:
 * - [ ] All 5 titles different and descriptive (not "Biến thể 1")
 * - [ ] All 5 have different openings/hooks
 * - [ ] All 5 have different CTAs
 * - [ ] At least 2 different structures visible
 * - [ ] Vietnamese sounds natural (no "dịch máy" tone)
 *
 * 10 variants:
 * - [ ] Same diversity criteria as above
 * - [ ] No repeated hooks across variants
 * - [ ] No identical CTA (e.g. "comment ngay") in all 10
 * - [ ] Format matches selected (TikTok short, FB readable, etc.)
 *
 * With Voice Profile:
 * - [ ] Variants reflect voice tone but are not copy-paste from samples
 *
 * Regression: JSON parser (src/lib/ai/json.ts) unchanged — verify remix still saves outputs.
 *
 * ALE-148 — no CJK leakage:
 * - [ ] 5 variants: no Chinese/Japanese/Korean glyphs in title or content
 * - [ ] 10 variants: same check across all variants
 * - [ ] If model leaks CJK once, retry succeeds or user sees clear error (not silent)
 */
