import type { BreakdownAnalysisResult } from "@/lib/ai/prompts/breakdown";
import type { RemixVariantsResult } from "@/lib/ai/prompts/remix";
import type { ContentAnalysisView } from "@/types/analysis";
import type { RemixFormat, RemixTone } from "@/types/remix";

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

export type RemixProviderInput = {
  title: string;
  platform: string;
  rawContent: string;
  format: RemixFormat;
  tone: RemixTone;
  variantCount: number;
  analysis: ContentAnalysisView | null;
};

export interface RemixGeneratorProvider {
  readonly name: string;
  generateVariants(input: RemixProviderInput): Promise<RemixVariantsResult>;
}
