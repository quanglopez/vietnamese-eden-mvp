import { AiProviderError } from "@/lib/ai/errors";
import { AI_RETRY_ADVICE } from "@/lib/content/loading-messages";

export type AiActionLabel = "phân tích" | "remix" | "giọng văn";

const GENERIC_MESSAGES: Record<AiActionLabel, string> = {
  "phân tích": "Phân tích AI chưa hoàn tất. Hãy thử lại sau ít phút.",
  remix: "Tạo remix chưa hoàn tất. Hãy thử lại sau ít phút.",
  "giọng văn": "Phân tích giọng văn chưa hoàn tất. Hãy thử lại sau ít phút.",
};

export function mapAiProviderError(error: unknown, action: AiActionLabel): string {
  const message = getErrorMessage(error).toLowerCase();

  if (isRateLimit(message)) {
    return "Bạn đã gửi quá nhiều yêu cầu AI. Hãy chờ khoảng 1 phút rồi thử lại.";
  }

  if (isTimeout(message)) {
    return `AI đang xử lý quá lâu. Hãy thử lại sau 30 giây hoặc dùng nội dung ngắn hơn. ${AI_RETRY_ADVICE}`;
  }

  if (isProviderUnavailable(message)) {
    return `Máy chủ AI đang bận hoặc tạm bảo trì. Hãy thử lại sau 1-2 phút. ${AI_RETRY_ADVICE}`;
  }

  if (error instanceof AiProviderError) {
    if (error.code === "missing_api_key" || error.code === "missing_config") {
      return "AI chưa được cấu hình đầy đủ. Vui lòng báo admin kiểm tra cấu hình.";
    }

    if (error.code === "invalid_response") {
      return `AI trả về kết quả chưa đạt yêu cầu cho ${action}. Hãy thử lại với nội dung rõ hơn.`;
    }
  }

  return `${GENERIC_MESSAGES[action]} ${AI_RETRY_ADVICE}`;
}

export function getSafeAiErrorLog(error: unknown): { name: string; code?: string } {
  if (error instanceof AiProviderError) {
    return { name: error.name, code: error.code };
  }
  if (error instanceof Error) {
    return { name: error.name };
  }
  return { name: "UnknownError" };
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "";
}

function isTimeout(message: string): boolean {
  return message.includes("timeout") || message.includes("timed out") || message.includes("aborted");
}

function isRateLimit(message: string): boolean {
  return message.includes("429") || message.includes("rate limit") || message.includes("too many requests");
}

function isProviderUnavailable(message: string): boolean {
  return (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("internal") ||
    message.includes("unavailable") ||
    message.includes("overloaded")
  );
}
