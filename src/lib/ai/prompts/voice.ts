import { z } from "zod";

export const voiceAnalysisSchema = z.object({
  tone: z.string().min(1),
  vocabulary: z.string().min(1),
  sentence_style: z.string().min(1),
  cta_style: z.string().min(1),
  content_structure: z.string().min(1),
  common_openings: z.array(z.string().min(1)).min(1),
  common_endings: z.array(z.string().min(1)).min(1),
  banned_phrases: z.array(z.string()).default([]),
  writing_rules: z.array(z.string().min(1)).min(2),
});

export type VoiceAnalysisResult = z.infer<typeof voiceAnalysisSchema>;

export const VOICE_ANALYSIS_SYSTEM_PROMPT = `Bạn là chuyên gia phân tích giọng viết tiếng Việt cho creator và marketer.
Nhiệm vụ: đọc các bài viết mẫu và mô tả giọng viết để AI có thể bắt chước khi tạo nội dung mới.

Quy tắc:
- Phân tích bằng tiếng Việt, súc tích, thực chiến.
- tone: tổng quan giọng điệu (1–2 câu).
- vocabulary: từ vựng, mức formal, từ hay dùng.
- sentence_style: nhịp câu, độ dài, emoji, xuống dòng.
- cta_style: cách kêu gọi hành động đặc trưng.
- content_structure: cấu trúc bài thường gặp.
- common_openings: 3–5 mở bài/hook hay dùng.
- common_endings: 3–5 kết bài hay dùng.
- banned_phrases: cụm nên tránh (có thể rỗng).
- writing_rules: 5–8 quy tắc bắt buộc khi viết theo giọng này.

Chỉ trả JSON đúng schema:
{
  "tone": string,
  "vocabulary": string,
  "sentence_style": string,
  "cta_style": string,
  "content_structure": string,
  "common_openings": string[],
  "common_endings": string[],
  "banned_phrases": string[],
  "writing_rules": string[]
}`;

export function buildVoiceAnalysisUserPrompt(input: {
  profileName: string;
  sampleWritings: string;
  description?: string | null;
}): string {
  return [
    `Tên profile: ${input.profileName}`,
    input.description?.trim() ? `Mô tả thêm: ${input.description.trim()}` : null,
    "",
    "Các bài viết mẫu (10–30 bài hoặc đoạn):",
    input.sampleWritings,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

export function buildVoiceProfilePromptBlock(profile: {
  name: string;
  tone: string;
  style: {
    vocabulary: string;
    sentence_style: string;
    cta_style: string;
    content_structure: string;
    common_openings: string[];
    common_endings: string[];
    banned_phrases: string[];
    writing_rules: string[];
  };
}): string {
  return [
    "Voice Profile (bắt buộc bám sát giọng này):",
    `Tên: ${profile.name}`,
    `Tone: ${profile.tone}`,
    `Từ vựng: ${profile.style.vocabulary}`,
    `Kiểu câu: ${profile.style.sentence_style}`,
    `CTA style: ${profile.style.cta_style}`,
    `Cấu trúc: ${profile.style.content_structure}`,
    `Mở bài hay dùng: ${profile.style.common_openings.join(" | ")}`,
    `Kết bài hay dùng: ${profile.style.common_endings.join(" | ")}`,
    profile.style.banned_phrases.length
      ? `Tránh: ${profile.style.banned_phrases.join(" | ")}`
      : null,
    `Quy tắc viết: ${profile.style.writing_rules.join(" · ")}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}
