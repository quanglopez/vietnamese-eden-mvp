import { openAiJsonCompletion } from "@/lib/ai/openai-chat";
import { AiProviderError } from "@/lib/ai/errors";
import {
  breakdownAnalysisSchema,
  buildBreakdownUserPrompt,
  BREAKDOWN_SYSTEM_PROMPT,
  type BreakdownAnalysisResult,
} from "@/lib/ai/prompts/breakdown";
import type { AnalysisProviderInput, ContentAnalysisProvider } from "@/lib/ai/types";

export class OpenAiContentAnalysisProvider implements ContentAnalysisProvider {
  readonly name: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.name = model;
  }

  async analyzeContent(input: AnalysisProviderInput): Promise<BreakdownAnalysisResult> {
    const parsed = await openAiJsonCompletion({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: BREAKDOWN_SYSTEM_PROMPT,
      userPrompt: buildBreakdownUserPrompt(input),
      temperature: 0.4,
    });

    const validated = breakdownAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError("JSON breakdown không đúng schema.", "invalid_response");
    }

    return validated.data;
  }
}
