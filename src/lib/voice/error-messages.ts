import { AiProviderError } from "@/lib/ai/errors";

function categorizeByMessage(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("timeout") || lower.includes("timed out")) {
    return "AI phân tích quá lâu. Hãy thử lại với mẫu viết ngắn hơn hoặc kiểm tra kết nối mạng.";
  }
  if (lower.includes("500") || lower.includes("internal")) {
    return "Máy chủ AI đang bận. Hãy thử lại sau 30 giây.";
  }
  if (lower.includes("rate limit")) {
    return "Bạn đã gửi quá nhiều yêu cầu. Hãy chờ 1 phút rồi thử lại.";
  }

  return null;
}

export function mapVoiceAnalysisError(error: unknown): string {
  if (error instanceof AiProviderError) {
    const categorized = categorizeByMessage(error.message);
    if (categorized) {
      return categorized;
    }
    return `Phân tích giọng viết thất bại. Lỗi: ${error.message}`;
  }

  if (error instanceof Error) {
    const categorized = categorizeByMessage(error.message);
    if (categorized) {
      return categorized;
    }
    return error.message || "Phân tích giọng viết thất bại.";
  }

  return "Phân tích giọng viết thất bại.";
}
