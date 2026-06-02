import { assertBreakdownNoNonVietnamese } from "@/lib/ai/json";
import { BreakdownContentError } from "@/lib/ai/errors";
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
  try {
    return await analyzeContentTextOnce(input);
  } catch (error) {
    if (error instanceof BreakdownContentError) {
      return analyzeContentTextOnce({
        ...input,
        vietnameseOnlyRepair: true,
      });
    }
    throw error;
  }
}

export async function generateRemixVariants(
  input: Parameters<RemixGeneratorProvider["generateVariants"]>[0],
) {
  const provider = getRemixGeneratorProvider();
  return provider.generateVariants(input);
}

export async function analyzeVoiceProfile(
  input: Parameters<
    ReturnType<typeof getVoiceAnalysisProvider>["analyzeVoice"]
  >[0],
) {
  const provider = getVoiceAnalysisProvider();
  return provider.analyzeVoice(input);
}
