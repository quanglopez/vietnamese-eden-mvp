export type RemixFormat =
  | "facebook_post"
  | "linkedin_post"
  | "tiktok_script"
  | "youtube_shorts_script"
  | "email";

export type RemixTone =
  | "expert"
  | "friendly"
  | "sales"
  | "storytelling"
  | "controversial";

export type GeneratedOutputView = {
  id: string;
  contentItemId: string;
  title: string;
  content: string;
  format: RemixFormat;
  formatLabel: string;
  tone: RemixTone;
  toneLabel: string;
  variantIndex: number;
  status: "draft" | "ready" | "published" | "archived";
  createdAt: string;
};

export type RemixPageContext = {
  itemId: string;
  itemTitle: string;
  boardId: string | null;
  hasRawContent: boolean;
  hasAnalysis: boolean;
  canGenerate: boolean;
  blockReason: string | null;
};
