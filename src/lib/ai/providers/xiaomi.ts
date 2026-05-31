import {
  normalizeChatApiBaseUrl,
  type ChatCompletionConfig,
} from "@/lib/ai/chat-completions";
import { resolveAiModel, resolveXiaomiCredentials } from "@/lib/ai/config";
import {
  OpenAiCompatibleContentAnalysisProvider,
  OpenAiCompatibleRemixGeneratorProvider,
  OpenAiCompatibleVoiceAnalysisProvider,
} from "@/lib/ai/providers/openai-compatible";
import type {
  ContentAnalysisProvider,
  RemixGeneratorProvider,
  VoiceAnalysisProvider,
} from "@/lib/ai/types";

export function createXiaomiChatConfig(): ChatCompletionConfig {
  const { apiKey, baseUrl } = resolveXiaomiCredentials();

  return {
    apiKey,
    baseUrl: normalizeChatApiBaseUrl(baseUrl),
    model: resolveAiModel("xiaomi"),
    providerName: "Xiaomi MiMo",
  };
}

export function createXiaomiContentAnalysisProvider(): ContentAnalysisProvider {
  return new OpenAiCompatibleContentAnalysisProvider(createXiaomiChatConfig());
}

export function createXiaomiRemixGeneratorProvider(): RemixGeneratorProvider {
  return new OpenAiCompatibleRemixGeneratorProvider(createXiaomiChatConfig());
}

export function createXiaomiVoiceAnalysisProvider(): VoiceAnalysisProvider {
  return new OpenAiCompatibleVoiceAnalysisProvider(createXiaomiChatConfig());
}
