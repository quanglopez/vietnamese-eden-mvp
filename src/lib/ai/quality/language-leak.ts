import { containsNonVietnameseChars } from "@/lib/ai/json";

export type LanguageLeakCheckResult =
  | { ok: true }
  | { ok: false; tokens: string[]; reason: string };

/** Ký tự Latin không dùng trong tiếng Việt chuẩn (ñ, ç, œ, …). */
const NON_VIETNAMESE_LATIN_CHARS = /[ñçœæß¿¡]/iu;

/**
 * Từ khóa nước ngoài tín hiệu cao — chỉ match theo ranh giới từ.
 * Không gồm từ trùng tiếng Việt (tem, sao, ma, …).
 */
const PORTUGUESE_HIGH_SIGNAL = [
  "pontos",
  "muito",
  "pelo",
  "pela",
  "pelos",
  "porque",
  "não",
  "são",
  "onde",
  "quando",
  "como",
  "para",
  "mais",
  "foram",
  "está",
  "estao",
  "você",
  "voce",
] as const;

const SPANISH_HIGH_SIGNAL = [
  "pero",
  "muy",
  "donde",
  "cuando",
  "porque",
  "tiene",
  "fueron",
  "también",
  "tambien",
  "está",
  "estan",
  "usted",
] as const;

const FRENCH_HIGH_SIGNAL = [
  "les",
  "des",
  "une",
  "dans",
  "cette",
  "pourquoi",
  "n'est",
  "nest",
  "vous",
  "avec",
] as const;

const FOREIGN_STOPWORDS: readonly string[] = [
  ...PORTUGUESE_HIGH_SIGNAL,
  ...SPANISH_HIGH_SIGNAL,
  ...FRENCH_HIGH_SIGNAL,
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findForeignStopwords(text: string): string[] {
  const normalized = text.normalize("NFC").toLowerCase();
  const found: string[] = [];

  for (const word of FOREIGN_STOPWORDS) {
    const pattern = new RegExp(
      `(?:^|[^\\p{L}])${escapeRegExp(word)}(?:[^\\p{L}]|$)`,
      "iu",
    );
    if (pattern.test(normalized)) {
      found.push(word);
    }
  }

  return found;
}

function findNonVietnameseLatinChars(text: string): string[] {
  const matches = text.match(new RegExp(NON_VIETNAMESE_LATIN_CHARS.source, "giu"));
  if (!matches) {
    return [];
  }
  return [...new Set(matches.map((char) => char.normalize("NFC")))];
}

/**
 * Kiểm tra rò rỉ ngôn ngữ không phải tiếng Việt (và không phải thuật ngữ Anh thông dụng).
 * Ưu tiên độ chính xác — tránh false positive với tiếng Việt hợp lệ.
 */
export function containsNonVietnameseTokens(
  text: string,
  options?: { ignorePunctuation?: boolean },
): LanguageLeakCheckResult {
  void options;

  if (!text.trim()) {
    return { ok: true };
  }

  if (containsNonVietnameseChars(text)) {
    return {
      ok: false,
      tokens: ["CJK"],
      reason: "Phát hiện ký tự Trung/Nhật/Hàn trong nội dung.",
    };
  }

  const latinChars = findNonVietnameseLatinChars(text);
  if (latinChars.length > 0) {
    return {
      ok: false,
      tokens: latinChars,
      reason: `Phát hiện ký tự Latin không dùng trong tiếng Việt: ${latinChars.join(", ")}`,
    };
  }

  const stopwords = findForeignStopwords(text);
  if (stopwords.length > 0) {
    return {
      ok: false,
      tokens: stopwords,
      reason: `Phát hiện từ khóa nước ngoài: ${stopwords.join(", ")}`,
    };
  }

  return { ok: true };
}
