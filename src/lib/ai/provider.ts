import {
  resolveAiProviderKind,
  shouldUseMockProvider,
} from "@/lib/ai/config";
import { MockContentAnalysisProvider } from "@/lib/ai/providers/mock";
import { MockRemixGeneratorProvider } from "@/lib/ai/providers/mock-remix";
import { MockVoiceAnalysisProvider } from "@/lib/ai/providers/mock-voice";
import {
  createOpenAiContentAnalysisProvider,
  createOpenAiRemixGeneratorProvider,
  createOpenAiVoiceAnalysisProvider,
} from "@/lib/ai/providers/openai";
import {
  createXiaomiContentAnalysisProvider,
  createXiaomiRemixGeneratorProvider,
  createXiaomiVoiceAnalysisProvider,
} from "@/lib/ai/providers/xiaomi";
import type {
  ContentAnalysisProvider,
  RemixGeneratorProvider,
  VoiceAnalysisProvider,
} from "@/lib/ai/types";

export {
  getActiveAiModelLabel,
  resolveAiProviderKind,
  shouldUseMockProvider,
} from "@/lib/ai/config";

export function getContentAnalysisProvider(): ContentAnalysisProvider {
  if (shouldUseMockProvider()) {
    return new MockContentAnalysisProvider();
  }

  const kind = resolveAiProviderKind();

  if (kind === "xiaomi") {
    return createXiaomiContentAnalysisProvider();
  }

  return createOpenAiContentAnalysisProvider();
}

export function getVoiceAnalysisProvider(): VoiceAnalysisProvider {
  if (shouldUseMockProvider()) {
    return new MockVoiceAnalysisProvider();
  }

  const kind = resolveAiProviderKind();

  if (kind === "xiaomi") {
    return createXiaomiVoiceAnalysisProvider();
  }

  return createOpenAiVoiceAnalysisProvider();
}

export function getRemixGeneratorProvider(): RemixGeneratorProvider {
  if (shouldUseMockProvider()) {
    return new MockRemixGeneratorProvider();
  }

  const kind = resolveAiProviderKind();

  if (kind === "xiaomi") {
    return createXiaomiRemixGeneratorProvider();
  }

  return createOpenAiRemixGeneratorProvider();
}
