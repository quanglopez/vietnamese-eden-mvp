import type { RemixFormat, RemixTone } from "@/types/remix";

import { getRemixFormatLabel, getRemixToneLabel } from "./constants";

const TITLE_META_PREFIX = "⟦remix:";

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

export function buildOutputTitle(input: {
  format: RemixFormat;
  tone: RemixTone;
  variantIndex: number;
}): string {
  const formatLabel = getRemixFormatLabel(input.format);
  const toneLabel = getRemixToneLabel(input.tone);
  const meta = `format=${input.format}|tone=${input.tone}|v=${input.variantIndex}`;
  const display = `${formatLabel} · ${toneLabel} · Biến thể ${input.variantIndex}`;
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
