import type { BreakdownAnalysisResult } from "@/lib/ai/prompts/breakdown";
import type { RemixVariantsResult } from "@/lib/ai/prompts/remix";
import type { VoiceAnalysisResult } from "@/lib/ai/prompts/voice";
import type { ContentAnalysisView } from "@/types/analysis";
import type { RemixFormat, RemixTone } from "@/types/remix";
import type { VoiceProfileView } from "@/types/voice";

export type AnalysisProviderInput = {
  title: string;
  platform: string;
  rawContent: string;
  sourceUrl?: string | null;
};

export interface ContentAnalysisProvider {
  readonly name: string;
  analyzeContent(input: AnalysisProviderInput): Promise<BreakdownAnalysisResult>;
}

export type VoiceAnalysisProviderInput = {
  profileName: string;
  sampleWritings: string;
  description?: string | null;
};

export interface VoiceAnalysisProvider {
  readonly name: string;
  analyzeVoice(input: VoiceAnalysisProviderInput): Promise<VoiceAnalysisResult>;
}

export type RemixProviderInput = {
  title: string;
  platform: string;
  rawContent: string;
  format: RemixFormat;
  tone: RemixTone;
  variantCount: number;
  analysis: ContentAnalysisView | null;
  voiceProfile: VoiceProfileView | null;
};

export interface RemixGeneratorProvider {
  readonly name: string;
  generateVariants(input: RemixProviderInput): Promise<RemixVariantsResult>;
}
