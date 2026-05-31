import type { RemixFormat, RemixTone } from "@/types/remix";

export const REMIX_FORMAT_OPTIONS: { value: RemixFormat; label: string }[] = [
  { value: "facebook_post", label: "Facebook post" },
  { value: "linkedin_post", label: "LinkedIn post" },
  { value: "tiktok_script", label: "TikTok script" },
  { value: "youtube_shorts_script", label: "YouTube Shorts script" },
  { value: "email", label: "Email" },
];

export const REMIX_TONE_OPTIONS: { value: RemixTone; label: string }[] = [
  { value: "expert", label: "Chuyên gia" },
  { value: "friendly", label: "Gần gũi" },
  { value: "sales", label: "Bán hàng" },
  { value: "storytelling", label: "Kể chuyện" },
  { value: "controversial", label: "Gây tranh luận" },
];

export const DEFAULT_REMIX_VARIANT_COUNT = 5;
export const MAX_REMIX_VARIANT_COUNT = 10;
export const MIN_REMIX_VARIANT_COUNT = 1;

export function getRemixFormatLabel(format: RemixFormat): string {
  return REMIX_FORMAT_OPTIONS.find((o) => o.value === format)?.label ?? format;
}

export function getRemixToneLabel(tone: RemixTone): string {
  return REMIX_TONE_OPTIONS.find((o) => o.value === tone)?.label ?? tone;
}
