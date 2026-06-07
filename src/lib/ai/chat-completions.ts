import { AiProviderError } from "@/lib/ai/errors";
import { parseAiJsonOrThrow } from "@/lib/ai/json";

export type ChatCompletionConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
  providerName: string;
};

export { extractJsonObject, extractJsonCandidate, parseAiJsonText } from "@/lib/ai/json";

export function normalizeChatApiBaseUrl(baseUrl: string): string {
  const trimmed = baseUrl.trim().replace(/\/+$/, "");

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    throw new AiProviderError(
      "Base URL phải bắt đầu bằng http:// hoặc https://.",
      "missing_config",
    );
  }

  return trimmed;
}

export function buildChatCompletionsUrl(baseUrl: string): string {
  const normalized = normalizeChatApiBaseUrl(baseUrl);

  if (normalized.endsWith("/chat/completions")) {
    return normalized;
  }

  return `${normalized}/chat/completions`;
}

export async function chatJsonCompletion(
  config: ChatCompletionConfig,
  input: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    timeoutMs?: number;
  },
): Promise<unknown> {
  const url = buildChatCompletionsUrl(config.baseUrl);
  const timeoutMs = input.timeoutMs ?? 90_000;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        temperature: input.temperature ?? 0.5,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: input.systemPrompt },
          { role: "user", content: input.userPrompt },
        ],
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new AiProviderError(
        `${config.providerName} request timed out after ${timeoutMs / 1000}s.`,
        "timeout",
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new AiProviderError(
      `${config.providerName} API lỗi (${response.status}): ${body.slice(0, 200)}`,
      "provider_error",
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new AiProviderError(
      `${config.providerName} trả về response rỗng.`,
      "invalid_response",
    );
  }

  return parseAiJsonOrThrow(content, config.providerName);
}
