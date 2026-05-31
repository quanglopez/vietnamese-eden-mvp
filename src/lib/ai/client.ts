import { AiProviderError } from "@/lib/ai/errors";
import { MockContentAnalysisProvider } from "@/lib/ai/providers/mock";
import { OpenAiContentAnalysisProvider } from "@/lib/ai/providers/openai";
import type { ContentAnalysisProvider } from "@/lib/ai/types";

export function getContentAnalysisProvider(): ContentAnalysisProvider {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const useMock = process.env.AI_USE_MOCK === "true";
  const isProduction = process.env.NODE_ENV === "production";

  if (useMock && !isProduction) {
    return new MockContentAnalysisProvider();
  }

  if (!apiKey) {
    throw new AiProviderError(
      "Thiếu OPENAI_API_KEY. Thêm key vào .env.local hoặc bật AI_USE_MOCK=true (chỉ dev).",
      "missing_api_key",
    );
  }

  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  return new OpenAiContentAnalysisProvider(apiKey, model);
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
