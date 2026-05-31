import type { CalendarChannel } from "@/types/calendar";

type CalendarNotesPayload = {
  channel?: CalendarChannel;
  user_notes?: string | null;
};

export function buildCalendarNotes(channel: CalendarChannel, userNotes?: string | null): string | null {
  const trimmed = userNotes?.trim() ?? "";
  const payload: CalendarNotesPayload = {
    channel,
    user_notes: trimmed || null,
  };
  if (!trimmed && channel === "other") {
    return null;
  }
  return JSON.stringify(payload);
}

export function parseCalendarNotes(raw: string | null): {
  channel: CalendarChannel | null;
  userNotes: string | null;
} {
  if (!raw?.trim()) {
    return { channel: null, userNotes: null };
  }
  try {
    const parsed = JSON.parse(raw) as CalendarNotesPayload;
    return {
      channel: parsed.channel ?? null,
      userNotes: parsed.user_notes?.trim() || null,
    };
  } catch {
    return { channel: null, userNotes: raw };
  }
}

export function resolveChannel(
  platform: import("@/types/content").PlatformType,
  notes: string | null,
): CalendarChannel {
  const parsed = parseCalendarNotes(notes);
  if (parsed.channel) {
    return parsed.channel;
  }
  switch (platform) {
    case "facebook":
      return "facebook";
    case "tiktok":
      return "tiktok";
    case "youtube":
      return "youtube_shorts";
    case "instagram":
      return "other";
    default:
      return "other";
  }
}
