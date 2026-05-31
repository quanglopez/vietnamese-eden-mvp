import type { VoiceStylePayload } from "@/types/voice";

export function buildStyleNotesPayload(
  analysis: Omit<VoiceStylePayload, "description">,
  description?: string | null,
): string {
  const payload: VoiceStylePayload = {
    ...analysis,
    description: description?.trim() || null,
  };
  return JSON.stringify(payload);
}

export function parseStyleNotes(raw: string | null): VoiceStylePayload | null {
  if (!raw?.trim()) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as VoiceStylePayload;
    if (typeof parsed.vocabulary !== "string") {
      return null;
    }
    return {
      vocabulary: parsed.vocabulary ?? "",
      sentence_style: parsed.sentence_style ?? "",
      cta_style: parsed.cta_style ?? "",
      content_structure: parsed.content_structure ?? "",
      common_openings: Array.isArray(parsed.common_openings) ? parsed.common_openings : [],
      common_endings: Array.isArray(parsed.common_endings) ? parsed.common_endings : [],
      banned_phrases: Array.isArray(parsed.banned_phrases) ? parsed.banned_phrases : [],
      writing_rules: Array.isArray(parsed.writing_rules) ? parsed.writing_rules : [],
      description: parsed.description ?? null,
    };
  } catch {
    return {
      vocabulary: "",
      sentence_style: raw,
      cta_style: "",
      content_structure: "",
      common_openings: [],
      common_endings: [],
      banned_phrases: [],
      writing_rules: [],
      description: null,
    };
  }
}
