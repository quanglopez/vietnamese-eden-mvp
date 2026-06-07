export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type ContentPost = {
  id: string;
  title: string;
  platform: "tiktok" | "facebook" | "instagram" | "youtube" | "linkedin" | "other";
  url: string;
  hook: string | null;
  angle: string | null;
  structure: string | null;
  cta: string | null;
  savedAt: string;
};

export type VoiceProfile = {
  id: string;
  userId: string;
  name: string;
  tone: string;
  sampleCount: number;
  updatedAt: string;
};

export type RemixDraft = {
  id: string;
  sourcePostId: string;
  voiceProfileId: string;
  content: string;
  status: "draft" | "ready" | "published";
  createdAt: string;
};
