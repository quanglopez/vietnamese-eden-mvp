import type { BreakdownAnalysisResult } from "@/lib/ai/prompts/breakdown";

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
