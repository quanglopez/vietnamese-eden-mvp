import {
  chatJsonCompletion,
  extractJsonObject,
  type ChatCompletionConfig,
} from "@/lib/ai/chat-completions";

export { extractJsonObject };

/**
 * @deprecated Use chatJsonCompletion from @/lib/ai/chat-completions with a ChatCompletionConfig.
 */
export async function openAiJsonCompletion(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<unknown> {
  const config: ChatCompletionConfig = {
    apiKey: input.apiKey,
    baseUrl:
      process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
    model: input.model,
    providerName: "OpenAI",
  };

  return chatJsonCompletion(config, {
    systemPrompt: input.systemPrompt,
    userPrompt: input.userPrompt,
    temperature: input.temperature,
  });
}
