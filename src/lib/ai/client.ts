import { assertBreakdownNoNonVietnamese } from "@/lib/ai/json";
import { BreakdownContentError, AiProviderError } from "@/lib/ai/errors";
import {
  getContentAnalysisProvider,
  getRemixGeneratorProvider,
  getVoiceAnalysisProvider,
} from "@/lib/ai/provider";
import type { BreakdownAnalysisResult } from "@/lib/ai/prompts/breakdown";
import type {
  AnalysisProviderInput,
  AnalysisSourceQualityHint,
  RemixGeneratorProvider,
} from "@/lib/ai/types";

export { getActiveAiModelLabel } from "@/lib/ai/provider";

async function analyzeContentTextOnce(
  input: AnalysisProviderInput,
): Promise<BreakdownAnalysisResult> {
  const provider = getContentAnalysisProvider();
  const result = await provider.analyzeContent(input);
  assertBreakdownNoNonVietnamese(result);
  return result;
}

export async function analyzeContentText(input: {
  title: string;
  platform: string;
  rawContent: string;
  sourceUrl?: string | null;
  sourceQuality?: AnalysisSourceQualityHint | null;
}): Promise<BreakdownAnalysisResult> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await analyzeContentTextOnce(
        attempt === 0
          ? input
          : { ...input, vietnameseOnlyRepair: attempt === 2 },
      );
    } catch (error) {
      lastError = error;

      // BreakdownContentError: retry once with vietnameseOnlyRepair
      if (error instanceof BreakdownContentError && attempt < 2) {
        continue;
      }

      // AiProviderError with "invalid_response" (empty response): retry
      if (
        error instanceof AiProviderError &&
        error.code === "invalid_response" &&
        attempt < 2
      ) {
        continue;
      }

      // AiProviderError with "timeout": retry once
      if (
        error instanceof AiProviderError &&
        error.code === "timeout" &&
        attempt < 1
      ) {
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

export async function generateRemixVariants(
  input: Parameters<RemixGeneratorProvider["generateVariants"]>[0],
) {
  const provider = getRemixGeneratorProvider();
  let lastError: unknown;

  // Single retry on invalid_response or timeout — provider has its own internal retry,
  // so we only retry once here to avoid 6x amplification (provider×2 × client×3).
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      return await provider.generateVariants(input);
    } catch (error) {
      lastError = error;
      if (
        error instanceof AiProviderError &&
        (error.code === "invalid_response" || error.code === "timeout") &&
        attempt < 1
      ) {
        continue;
      }
      throw error;
    }
  }

  throw lastError;
}

export async function analyzeVoiceProfile(
  input: Parameters<
    ReturnType<typeof getVoiceAnalysisProvider>["analyzeVoice"]
  >[0],
) {
  const provider = getVoiceAnalysisProvider();
  return provider.analyzeVoice(input);
}
