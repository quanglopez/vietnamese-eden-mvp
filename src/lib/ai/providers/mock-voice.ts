import {
  voiceAnalysisSchema,
  type VoiceAnalysisResult,
} from "@/lib/ai/prompts/voice";
import type { VoiceAnalysisProvider, VoiceAnalysisProviderInput } from "@/lib/ai/types";

export class MockVoiceAnalysisProvider implements VoiceAnalysisProvider {
  readonly name = "mock-dev-voice";

  async analyzeVoice(input: VoiceAnalysisProviderInput): Promise<VoiceAnalysisResult> {
    const snippet = input.sampleWritings.trim().slice(0, 100);
    const result: VoiceAnalysisResult = {
      tone: "Gần gũi, thẳng thắn, có chút hài hước nhẹ — phù hợp creator Việt.",
      vocabulary: "Từ đời thường, xen emoji vừa phải, tránh văn hoa.",
      sentence_style: "Câu ngắn, xuống dòng nhiều, nhịp nhanh như đang nói chuyện.",
      cta_style: "CTA mềm: comment/inbox, không ép mua gắt.",
      content_structure: "Hook → story cá nhân → insight 3 bullet → CTA.",
      common_openings: [
        "Mình từng nghĩ…",
        "Thật ra không phải ai cũng biết…",
        "3 điều mình ước biết sớm hơn:",
      ],
      common_endings: [
        "Bạn thấy sao? Comment cho mình biết nhé.",
        "Save lại khi cần.",
        "Follow để xem phần 2.",
      ],
      banned_phrases: ["Tuyệt vời không thể tin được", "Đỉnh cao chóp óc"],
      writing_rules: [
        "Luôn xưng 'mình' với audience.",
        "Mỗi đoạn tối đa 2–3 câu.",
        "Có số liệu hoặc ví dụ cụ thể khi có thể.",
        snippet ? `Giữ vibe từ mẫu: "${snippet}…"` : "Giữ vibe tự nhiên tiếng Việt.",
        "Không dùng tiếng Anh trừ thuật ngữ cần thiết.",
      ],
    };

    return voiceAnalysisSchema.parse(result);
  }
}
