import { AiProviderError } from "@/lib/ai/errors";

export function extractJsonObject(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) {
    throw new AiProviderError("AI không trả về JSON hợp lệ.", "invalid_response");
  }
  return match[0];
}

export async function openAiJsonCompletion(input: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
}): Promise<unknown> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: input.model,
      temperature: input.temperature ?? 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: input.systemPrompt },
        { role: "user", content: input.userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new AiProviderError(
      `OpenAI API lỗi (${response.status}): ${body.slice(0, 200)}`,
      "provider_error",
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };

  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new AiProviderError("OpenAI trả về response rỗng.", "invalid_response");
  }

  try {
    return JSON.parse(extractJsonObject(content));
  } catch {
    throw new AiProviderError("Không parse được JSON từ OpenAI.", "invalid_response");
  }
}
