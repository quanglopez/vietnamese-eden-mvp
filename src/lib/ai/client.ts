import {
  getContentAnalysisProvider,
  getRemixGeneratorProvider,
  getVoiceAnalysisProvider,
} from "@/lib/ai/provider";
import type { RemixGeneratorProvider } from "@/lib/ai/types";

export { getActiveAiModelLabel } from "@/lib/ai/provider";

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

export async function analyzeVoiceProfile(
  input: Parameters<
    ReturnType<typeof getVoiceAnalysisProvider>["analyzeVoice"]
  >[0],
) {
  const provider = getVoiceAnalysisProvider();
  return provider.analyzeVoice(input);
}
