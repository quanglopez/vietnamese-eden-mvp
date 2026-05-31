import { openAiJsonCompletion } from "@/lib/ai/openai-chat";
import { AiProviderError } from "@/lib/ai/errors";
import {
  buildRemixUserPrompt,
  remixVariantsSchema,
  REMIX_SYSTEM_PROMPT,
  type RemixVariantsResult,
} from "@/lib/ai/prompts/remix";
import type { RemixGeneratorProvider, RemixProviderInput } from "@/lib/ai/types";

export class OpenAiRemixGeneratorProvider implements RemixGeneratorProvider {
  readonly name: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    this.name = model;
  }

  async generateVariants(input: RemixProviderInput): Promise<RemixVariantsResult> {
    const parsed = await openAiJsonCompletion({
      apiKey: this.apiKey,
      model: this.model,
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
