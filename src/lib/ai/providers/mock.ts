import {
  breakdownAnalysisSchema,
  type BreakdownAnalysisResult,
} from "@/lib/ai/prompts/breakdown";
import type { AnalysisProviderInput, ContentAnalysisProvider } from "@/lib/ai/types";

export class MockContentAnalysisProvider implements ContentAnalysisProvider {
  readonly name = "mock-dev";

  async analyzeContent(input: AnalysisProviderInput): Promise<BreakdownAnalysisResult> {
    const preview = input.rawContent.trim().slice(0, 120);
    const result: BreakdownAnalysisResult = {
      hook: preview.split(/[.!?]/)[0]?.trim() || preview,
      angle: "Góc nhìn người trong cuộc — chia sẻ trải nghiệm thật thay vì dạy lý thuyết.",
      structure:
        "1. Hook gây tò mò bằng con số hoặc tuyên bố mạnh\n2. Bối cảnh cá nhân ngắn\n3. Liệt kê insight/sản phẩm/lesson\n4. CTA mềm kéo comment",
      cta: "Comment để nhận checklist / tư vấn cá nhân trong 24h.",
      emotion: "Tò mò + tin tưởng (social proof cá nhân)",
      target_audience: "Creator và người tiêu dùng Gen Z/Millennial Việt Nam quan tâm niche này.",
      why_it_works:
        "Kết hợp số liệu cụ thể, giọng thật và CTA cá nhân hóa — pattern quen thuộc trên TikTok/Reels VN.",
      remix_suggestions: [
        "Đổi hook sang dạng 'Tôi đã tốn X triệu để học bài này…'",
        "Thêm proof screenshot/DM khách hàng ở giữa video.",
        "CTA: 'Gõ 1 nếu bạn muốn mình gửi template caption'.",
      ],
    };

    return breakdownAnalysisSchema.parse(result);
  }
}
