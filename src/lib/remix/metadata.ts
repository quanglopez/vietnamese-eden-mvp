import type { RemixFormat, RemixTone } from "@/types/remix";

import { getRemixFormatLabel, getRemixToneLabel } from "./constants";

const TITLE_META_PREFIX = "⟦remix:";

export const ANGLE_NAMES = [
  "Story",
  "List/Tips",
  "Before/After",
  "Myth-Busting",
  "Data/Stat",
  "Hook/Opener",
  "Controversial",
  "How-To",
  "Confession",
  "Behind-Scenes",
  "Question",
  "Comparison",
  "Quote/Reframe",
  "FOMO/Urgency",
  "Benefit-first",
] as const;

type TitleMeta = {
  format: RemixFormat;
  tone: RemixTone;
  variantIndex: number;
};

const FORMAT_VALUES = new Set([
  "facebook_post",
  "linkedin_post",
  "tiktok_script",
  "youtube_shorts_script",
  "email",
]);

const TONE_VALUES = new Set(["expert", "friendly", "sales", "storytelling", "controversial"]);

function isRemixFormat(value: string): value is RemixFormat {
  return FORMAT_VALUES.has(value);
}

function isRemixTone(value: string): value is RemixTone {
  return TONE_VALUES.has(value);
}

export function getAngleNameForIndex(index: number): string {
  return ANGLE_NAMES[index % ANGLE_NAMES.length] ?? "Remix";
}

export function isGenericTitle(title: string): boolean {
  const t = title.trim().toLowerCase();
  if (t.length < 5) {
    return true;
  }

  const genericPatterns = [
    /^biến thể \d+/,
    /^bản \d+/,
    /^variant[\s\w]*\d+/i,
    /^remix[\s\w]*\d+/i,
    /^facebook[\s·]+gần gũi/i,
    /^tiktok[\s·]+chuyên gia/i,
    /·\s*biến thể \d+\s*$/,
  ];

  return genericPatterns.some((pattern) => pattern.test(t));
}

export function getAngleLabelFromDisplayTitle(
  displayTitle: string,
  variantIndex: number,
): string {
  const colonPrefix = displayTitle.match(/^([^:]{2,24}):/)?.[1]?.trim();
  if (colonPrefix && !isGenericTitle(colonPrefix)) {
    return colonPrefix;
  }

  const dotPrefix = displayTitle.match(/^([^·]{2,24})\s·/)?.[1]?.trim();
  if (dotPrefix && !isGenericTitle(dotPrefix)) {
    return dotPrefix;
  }

  return getAngleNameForIndex(variantIndex);
}

export function buildOutputTitle(input: {
  format: RemixFormat;
  tone: RemixTone;
  variantIndex: number;
  aiTitle?: string;
  angle?: string;
}): string {
  const formatLabel = getRemixFormatLabel(input.format);
  const toneLabel = getRemixToneLabel(input.tone);
  const meta = `format=${input.format}|tone=${input.tone}|v=${input.variantIndex}`;

  const angleName = input.angle ?? getAngleNameForIndex(input.variantIndex);
  const fallbackDisplay = `${angleName} · ${formatLabel} · ${toneLabel}`;

  const display =
    input.aiTitle && !isGenericTitle(input.aiTitle)
      ? input.aiTitle.trim()
      : fallbackDisplay;

  return `${TITLE_META_PREFIX}${meta}⟧ ${display}`;
}

export function parseOutputTitle(storedTitle: string | null): TitleMeta | null {
  if (!storedTitle?.startsWith(TITLE_META_PREFIX)) {
    return null;
  }
  const end = storedTitle.indexOf("⟧");
  if (end === -1) {
    return null;
  }
  const metaPart = storedTitle.slice(TITLE_META_PREFIX.length, end);
  const parts = Object.fromEntries(
    metaPart.split("|").map((pair) => {
      const [key, value] = pair.split("=");
      return [key, value];
    }),
  );

  const format = parts.format ?? "";
  const tone = parts.tone ?? "";
  const variantIndex = Number(parts.v);

  if (!isRemixFormat(format) || !isRemixTone(tone) || !Number.isFinite(variantIndex)) {
    return null;
  }

  return { format, tone, variantIndex };
}

export function getDisplayTitle(storedTitle: string | null): string {
  if (!storedTitle) {
    return "Remix";
  }
  const end = storedTitle.indexOf("⟧ ");
  if (storedTitle.startsWith(TITLE_META_PREFIX) && end !== -1) {
    return storedTitle.slice(end + 2);
  }
  return storedTitle;
}
