import {
  chatJsonCompletion,
  type ChatCompletionConfig,
} from "@/lib/ai/chat-completions";
import { AiProviderError } from "@/lib/ai/errors";
import {
  breakdownAnalysisSchema,
  buildBreakdownUserPrompt,
  BREAKDOWN_SYSTEM_PROMPT,
  type BreakdownAnalysisResult,
} from "@/lib/ai/prompts/breakdown";
import {
  buildRemixUserPrompt,
  remixVariantsSchema,
  REMIX_SYSTEM_PROMPT,
  type RemixVariantsResult,
} from "@/lib/ai/prompts/remix";
import {
  buildVoiceAnalysisUserPrompt,
  voiceAnalysisSchema,
  VOICE_ANALYSIS_SYSTEM_PROMPT,
  type VoiceAnalysisResult,
} from "@/lib/ai/prompts/voice";
import type {
  AnalysisProviderInput,
  ContentAnalysisProvider,
  RemixGeneratorProvider,
  RemixProviderInput,
  VoiceAnalysisProvider,
  VoiceAnalysisProviderInput,
} from "@/lib/ai/types";

export class OpenAiCompatibleContentAnalysisProvider
  implements ContentAnalysisProvider
{
  readonly name: string;

  constructor(private readonly chat: ChatCompletionConfig) {
    this.name = chat.model;
  }

  async analyzeContent(
    input: AnalysisProviderInput,
  ): Promise<BreakdownAnalysisResult> {
    const parsed = await chatJsonCompletion(this.chat, {
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

export class OpenAiCompatibleRemixGeneratorProvider
  implements RemixGeneratorProvider
{
  readonly name: string;

  constructor(private readonly chat: ChatCompletionConfig) {
    this.name = chat.model;
  }

  async generateVariants(
    input: RemixProviderInput,
  ): Promise<RemixVariantsResult> {
    const parsed = await chatJsonCompletion(this.chat, {
      systemPrompt: REMIX_SYSTEM_PROMPT,
      userPrompt: buildRemixUserPrompt(input),
      temperature: 0.7,
    });

    const validated = remixVariantsSchema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError("JSON remix không đúng schema.", "invalid_response");
    }

    if (validated.data.variants.length < input.variantCount) {
      throw new AiProviderError(
        `AI chỉ trả về ${validated.data.variants.length}/${input.variantCount} biến thể.`,
        "invalid_response",
      );
    }

    return {
      variants: validated.data.variants.slice(0, input.variantCount),
    };
  }
}

export class OpenAiCompatibleVoiceAnalysisProvider
  implements VoiceAnalysisProvider
{
  readonly name: string;

  constructor(private readonly chat: ChatCompletionConfig) {
    this.name = chat.model;
  }

  async analyzeVoice(
    input: VoiceAnalysisProviderInput,
  ): Promise<VoiceAnalysisResult> {
    const parsed = await chatJsonCompletion(this.chat, {
      systemPrompt: VOICE_ANALYSIS_SYSTEM_PROMPT,
      userPrompt: buildVoiceAnalysisUserPrompt(input),
      temperature: 0.35,
    });

    const validated = voiceAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError(
        "JSON voice profile không đúng schema.",
        "invalid_response",
      );
    }

    return validated.data;
  }
}
