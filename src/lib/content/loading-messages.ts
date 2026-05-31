export type AiLoadingTask = "breakdown" | "remix" | "voice";

export const BREAKDOWN_MESSAGES = [
  "AI đang phân tích nội dung…",
  "Đang nhận diện hook, angle và CTA…",
  "Đánh giá thương hiệu và cảm xúc…",
  "Gần xong rồi, đang tổng hợp…",
] as const;

export const REMIX_MESSAGES = [
  "Đang tạo các biến thể từ nội dung gốc…",
  "Đang viết lại theo angle khác nhau…",
  "Đang kiểm tra độ đa dạng…",
  "Gần xong rồi, đang hoàn thiện từng bản…",
] as const;

export const VOICE_MESSAGES = [
  "AI đang đọc các bài viết mẫu…",
  "Đang phân tích từ vựng và cấu trúc câu…",
  "Đang nhận diện tone và quy tắc viết…",
  "Đang tổng hợp giọng văn, có thể mất thêm chút…",
] as const;

export const DEFAULT_MESSAGE =
  "AI đang xử lý… Có thể mất 30–90 giây. Vui lòng không đóng trang.";

export const AI_RETRY_ADVICE =
  "Không thể hoàn tất. Có thể do mạng chậm hoặc server bận. Hãy thử lại.";

const TASK_CONFIG: Record<
  AiLoadingTask,
  { messages: readonly string[]; intervalSec: number; maxProgressSec: number }
> = {
  breakdown: {
    messages: BREAKDOWN_MESSAGES,
    intervalSec: 10,
    maxProgressSec: 90,
  },
  remix: {
    messages: REMIX_MESSAGES,
    intervalSec: 10,
    maxProgressSec: 120,
  },
  voice: {
    messages: VOICE_MESSAGES,
    intervalSec: 12,
    maxProgressSec: 120,
  },
};

export function getLoadingMessage(
  task: AiLoadingTask,
  elapsedSeconds: number,
): string {
  const config = TASK_CONFIG[task];
  const index = Math.min(
    Math.floor(elapsedSeconds / config.intervalSec),
    config.messages.length - 1,
  );
  return config.messages[index] ?? DEFAULT_MESSAGE;
}

export function getLoadingStepText(
  task: AiLoadingTask,
  elapsedSeconds: number,
): string {
  const config = TASK_CONFIG[task];
  const step = Math.min(
    Math.floor(elapsedSeconds / config.intervalSec) + 1,
    config.messages.length,
  );
  return `Bước ${step}/${config.messages.length}`;
}

export function getEstimatedProgress(
  task: AiLoadingTask,
  elapsedSeconds: number,
): number {
  const { maxProgressSec } = TASK_CONFIG[task];
  return Math.min(95, Math.round((elapsedSeconds / maxProgressSec) * 100));
}
