import type { ManualTag } from "@/types/tags";

export type PlatformType =
  | "tiktok"
  | "facebook"
  | "instagram"
  | "youtube"
  | "other";

export type BoardContentItem = {
  id: string;
  title: string;
  platform: PlatformType;
  sourceUrl: string | null;
  rawContent: string | null;
  authorName: string | null;
  savedAt: string;
  sortOrder: number;
  addedAt: string;
  tags: ManualTag[];
};
