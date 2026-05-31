import { AiProviderError } from "@/lib/ai/errors";

export type AiProviderKind = "mock" | "openai" | "xiaomi";

const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";

export function resolveAiProviderKind(): AiProviderKind {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();

  if (!raw) {
    return "openai";
  }

  if (raw === "mock" || raw === "openai" || raw === "xiaomi") {
    return raw;
  }

  throw new AiProviderError(
    `AI_PROVIDER không hợp lệ: "${raw}". Dùng mock, openai, hoặc xiaomi.`,
    "missing_config",
  );
}

export function shouldUseMockProvider(): boolean {
  return (
    process.env.AI_USE_MOCK === "true" && process.env.NODE_ENV !== "production"
  );
}

export function resolveAiModel(kind: AiProviderKind): string {
  const fromEnv = process.env.AI_MODEL?.trim();
  if (fromEnv) {
    return fromEnv;
  }

  if (kind === "xiaomi") {
    return "mimo-v2.5";
  }

  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function getActiveAiModelLabel(): string {
  if (shouldUseMockProvider()) {
    return "mock-dev";
  }

  const kind = resolveAiProviderKind();
  const model = resolveAiModel(kind);

  if (kind === "xiaomi") {
    return `xiaomi:${model}`;
  }

  return model;
}

export function resolveOpenAiCredentials(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new AiProviderError(
      "Thiếu OPENAI_API_KEY. Thêm key vào env hoặc bật AI_USE_MOCK=true (chỉ dev), hoặc đặt AI_PROVIDER=xiaomi.",
      "missing_api_key",
    );
  }

  const baseUrl =
    process.env.OPENAI_BASE_URL?.trim() || OPENAI_DEFAULT_BASE_URL;

  return { apiKey, baseUrl };
}

export function resolveXiaomiCredentials(): { apiKey: string; baseUrl: string } {
  const apiKey = process.env.XIAOMI_API_KEY?.trim();
  const baseUrl = process.env.XIAOMI_BASE_URL?.trim();

  if (!apiKey || !baseUrl) {
    throw new AiProviderError(
      "XIAOMI_BASE_URL hoặc Xiaomi API contract chưa được cấu hình. Đặt XIAOMI_API_KEY và XIAOMI_BASE_URL (theo Xiaomi MiMo Open Platform docs), hoặc AI_PROVIDER=openai để rollback.",
      "missing_config",
    );
  }

  return { apiKey, baseUrl };
}
