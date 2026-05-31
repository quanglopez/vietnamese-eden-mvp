import {
  normalizeChatApiBaseUrl,
  type ChatCompletionConfig,
} from "@/lib/ai/chat-completions";
import { resolveAiModel, resolveOpenAiCredentials } from "@/lib/ai/config";
import {
  OpenAiCompatibleContentAnalysisProvider,
  OpenAiCompatibleRemixGeneratorProvider,
  OpenAiCompatibleVoiceAnalysisProvider,
} from "@/lib/ai/providers/openai-compatible";

export {
  OpenAiCompatibleContentAnalysisProvider,
  OpenAiCompatibleRemixGeneratorProvider,
  OpenAiCompatibleVoiceAnalysisProvider,
};
import type {
  ContentAnalysisProvider,
  RemixGeneratorProvider,
  VoiceAnalysisProvider,
} from "@/lib/ai/types";

export function createOpenAiChatConfig(): ChatCompletionConfig {
  const { apiKey, baseUrl } = resolveOpenAiCredentials();

  return {
    apiKey,
    baseUrl: normalizeChatApiBaseUrl(baseUrl),
    model: resolveAiModel("openai"),
    providerName: "OpenAI",
  };
}

export function createOpenAiContentAnalysisProvider(): ContentAnalysisProvider {
  return new OpenAiCompatibleContentAnalysisProvider(createOpenAiChatConfig());
}

export function createOpenAiRemixGeneratorProvider(): RemixGeneratorProvider {
  return new OpenAiCompatibleRemixGeneratorProvider(createOpenAiChatConfig());
}

export function createOpenAiVoiceAnalysisProvider(): VoiceAnalysisProvider {
  return new OpenAiCompatibleVoiceAnalysisProvider(createOpenAiChatConfig());
}

/** @deprecated Use createOpenAiContentAnalysisProvider */
export class OpenAiContentAnalysisProvider extends OpenAiCompatibleContentAnalysisProvider {
  constructor(apiKey: string, model: string) {
    super({
      apiKey,
      baseUrl: normalizeChatApiBaseUrl(
        process.env.OPENAI_BASE_URL?.trim() || "https://api.openai.com/v1",
      ),
      model,
      providerName: "OpenAI",
    });
  }
}
