import { AiProviderError, RemixContentError } from "@/lib/ai/errors";

export type ParseAiJsonResult =
  | { ok: true; data: unknown }
  | { ok: false; reason: string; preview: string };

const PREVIEW_MAX = 240;

function previewForLog(text: string): string {
  const oneLine = text.replace(/\s+/g, " ").trim();
  return oneLine.length <= PREVIEW_MAX
    ? oneLine
    : `${oneLine.slice(0, PREVIEW_MAX)}…`;
}

/** Strip ```json ... ``` or generic fenced blocks. */
export function stripMarkdownCodeFences(text: string): string {
  const trimmed = text.trim();

  const fenced = trimmed.match(/^```(?:json|JSON)?\s*([\s\S]*?)```\s*$/);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const inlineFence = trimmed.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (inlineFence?.[1]) {
    return inlineFence[1].trim();
  }

  return trimmed;
}

/** Remove trailing commas before `]` or `}` (common model mistake). */
export function removeSimpleTrailingCommas(jsonText: string): string {
  return jsonText.replace(/,\s*([}\]])/g, "$1");
}

function findJsonStart(text: string): { index: number; open: "{" | "[" } | null {
  const objectIndex = text.indexOf("{");
  const arrayIndex = text.indexOf("[");

  if (objectIndex === -1 && arrayIndex === -1) {
    return null;
  }

  if (objectIndex === -1) {
    return { index: arrayIndex, open: "[" };
  }

  if (arrayIndex === -1) {
    return { index: objectIndex, open: "{" };
  }

  if (arrayIndex < objectIndex) {
    return { index: arrayIndex, open: "[" };
  }

  return { index: objectIndex, open: "{" };
}

/** Extract outermost balanced `{...}` or `[...]` from a position. */
export function extractBalancedJsonSlice(
  text: string,
  startIndex: number,
  open: "{" | "[",
): string {
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) {
        return text.slice(startIndex, i + 1);
      }
    }
  }

  throw new AiProviderError(
    "JSON từ AI bị cắt cụt hoặc không đóng ngoặc đúng.",
    "invalid_response",
  );
}

export function extractJsonCandidate(text: string): string {
  const withoutFences = stripMarkdownCodeFences(text.trim());
  const start = findJsonStart(withoutFences);

  if (!start) {
    throw new AiProviderError("AI không trả về JSON hợp lệ.", "invalid_response");
  }

  const slice = extractBalancedJsonSlice(withoutFences, start.index, start.open);
  return removeSimpleTrailingCommas(slice);
}

export function parseAiJsonText(text: string): ParseAiJsonResult {
  try {
    const candidate = extractJsonCandidate(text);
    const data = JSON.parse(candidate) as unknown;
    return { ok: true, data };
  } catch (error) {
    const reason =
      error instanceof AiProviderError
        ? error.message
        : error instanceof SyntaxError
          ? "Cú pháp JSON không hợp lệ."
          : "Không parse được JSON.";

    return { ok: false, reason, preview: previewForLog(text) };
  }
}

export function parseAiJsonOrThrow(
  text: string,
  providerName: string,
): unknown {
  const result = parseAiJsonText(text);

  if (result.ok) {
    return result.data;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(
      `[ai-json] parse fail (${providerName}): ${result.reason} | preview: ${result.preview}`,
    );
  }

  throw new AiProviderError(
    `Không đọc được JSON từ ${providerName}. ${result.reason} Thử giảm số biến thể hoặc tạo lại.`,
    "invalid_response",
  );
}

/** @deprecated Use extractJsonCandidate — kept for imports from openai-chat */
export function extractJsonObject(text: string): string {
  return extractJsonCandidate(text);
}

/** CJK Unified Ideographs, Hiragana, Katakana, Hangul (ALE-148). Emoji allowed. */
const CJK_BLOCKS =
  /[\u4E00-\u9FFF\u3400-\u4DBF\uAC00-\uD7AF\u3040-\u309F\u30A0-\u30FF]/;

export function containsNonVietnameseChars(text: string): boolean {
  return CJK_BLOCKS.test(text);
}

export function assertRemixVariantsNoCjk(
  variants: { title: string; content: string }[],
): void {
  const hasLeakage = variants.some(
    (variant) =>
      containsNonVietnameseChars(variant.title) ||
      containsNonVietnameseChars(variant.content),
  );

  if (hasLeakage) {
    throw new RemixContentError(
      "Phát hiện ký tự không phải tiếng Việt (Trung/Nhật/Hàn) trong nội dung remix. Vui lòng thử tạo lại.",
    );
  }
}
