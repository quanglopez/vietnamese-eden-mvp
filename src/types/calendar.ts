import type { PlatformType } from "@/types/content";

export type CalendarStatus = "scheduled" | "published" | "skipped" | "failed";

/** Kênh hiển thị UI — map xuống platform_type + notes JSON */
export type CalendarChannel =
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "youtube_shorts"
  | "email"
  | "blog"
  | "other";

export type CalendarItemView = {
  id: string;
  workspaceId: string;
  generatedOutputId: string | null;
  contentItemId: string | null;
  title: string;
  platform: PlatformType;
  channel: CalendarChannel;
  channelLabel: string;
  scheduledAt: string;
  status: CalendarStatus;
  notes: string | null;
  userNotes: string | null;
  contentPreview: string | null;
  outputTitle: string | null;
  createdAt: string;
};
