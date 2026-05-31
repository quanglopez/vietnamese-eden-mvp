import { AiProviderError } from "@/lib/ai/errors";
import { MockContentAnalysisProvider } from "@/lib/ai/providers/mock";
import { MockRemixGeneratorProvider } from "@/lib/ai/providers/mock-remix";
import { OpenAiContentAnalysisProvider } from "@/lib/ai/providers/openai";
import { OpenAiRemixGeneratorProvider } from "@/lib/ai/providers/openai-remix";
import type { ContentAnalysisProvider, RemixGeneratorProvider } from "@/lib/ai/types";

function resolveAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const useMock = process.env.AI_USE_MOCK === "true";
  const isProduction = process.env.NODE_ENV === "production";
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return { apiKey, useMock, isProduction, model };
}

export function getContentAnalysisProvider(): ContentAnalysisProvider {
  const { apiKey, useMock, isProduction, model } = resolveAiConfig();

  if (useMock && !isProduction) {
    return new MockContentAnalysisProvider();
  }

  if (!apiKey) {
    throw new AiProviderError(
      "Thiếu OPENAI_API_KEY. Thêm key vào .env.local hoặc bật AI_USE_MOCK=true (chỉ dev).",
      "missing_api_key",
    );
  }

  return new OpenAiContentAnalysisProvider(apiKey, model);
}

export function getRemixGeneratorProvider(): RemixGeneratorProvider {
  const { apiKey, useMock, isProduction, model } = resolveAiConfig();

  if (useMock && !isProduction) {
    return new MockRemixGeneratorProvider();
  }

  if (!apiKey) {
    throw new AiProviderError(
      "Thiếu OPENAI_API_KEY. Thêm key vào .env.local hoặc bật AI_USE_MOCK=true (chỉ dev).",
      "missing_api_key",
    );
  }

  return new OpenAiRemixGeneratorProvider(apiKey, model);
}

export async function analyzeContentText(input: {
  title: string;
  platform: string;
  rawContent: string;
  sourceUrl?: string | null;
}) {
  const provider = getContentAnalysisProvider();
  return provider.analyzeContent(input);
}

export async function generateRemixVariants(
  input: Parameters<RemixGeneratorProvider["generateVariants"]>[0],
) {
  const provider = getRemixGeneratorProvider();
  return provider.generateVariants(input);
}
