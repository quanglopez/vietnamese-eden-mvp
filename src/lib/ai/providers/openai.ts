import { AiProviderError } from "@/lib/ai/errors";
import {
  breakdownAnalysisSchema,
  buildBreakdownUserPrompt,
  BREAKDOWN_SYSTEM_PROMPT,
  type BreakdownAnalysisResult,
} from "@/lib/ai/prompts/breakdown";
import type { AnalysisProviderInput, ContentAnalysisProvider } from "@/lib/ai/types";

function extractJsonObject(text: string): string {
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
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: BREAKDOWN_SYSTEM_PROMPT },
          { role: "user", content: buildBreakdownUserPrompt(input) },
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

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJsonObject(content));
    } catch {
      throw new AiProviderError("Không parse được JSON từ OpenAI.", "invalid_response");
    }

    const validated = breakdownAnalysisSchema.safeParse(parsed);
    if (!validated.success) {
      throw new AiProviderError("JSON breakdown không đúng schema.", "invalid_response");
    }

    return validated.data;
  }
}
