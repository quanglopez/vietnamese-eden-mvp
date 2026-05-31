import { openAiJsonCompletion } from "@/lib/ai/openai-chat";
import { AiProviderError } from "@/lib/ai/errors";
import {
  buildVoiceAnalysisUserPrompt,
  voiceAnalysisSchema,
  VOICE_ANALYSIS_SYSTEM_PROMPT,
  type VoiceAnalysisResult,
} from "@/lib/ai/prompts/voice";
import type { VoiceAnalysisProvider, VoiceAnalysisProviderInput } from "@/lib/ai/types";

export class OpenAiVoiceAnalysisProvider implements VoiceAnalysisProvider {
  readonly name: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.name = model;
  }

  async analyzeVoice(input: VoiceAnalysisProviderInput): Promise<VoiceAnalysisResult> {
    const parsed = await openAiJsonCompletion({
      apiKey: this.apiKey,
      model: this.model,
      systemPrompt: VOICE_ANALYSIS_SYSTEM_PROMPT,
      userPrompt: buildVoiceAnalysisUserPrompt(input),
      temperature: 0.35,
    });

    const validated = voiceAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError("JSON voice profile không đúng schema.", "invalid_response");
    }

    return validated.data;
  }
}
