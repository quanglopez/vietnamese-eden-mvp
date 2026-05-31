export type VoiceStylePayload = {
  vocabulary: string;
  sentence_style: string;
  cta_style: string;
  content_structure: string;
  common_openings: string[];
  common_endings: string[];
  banned_phrases: string[];
  writing_rules: string[];
  description?: string | null;
};

export type VoiceProfileView = {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  tone: string;
  style: VoiceStylePayload;
  sampleCount: number;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type VoiceProfileListItem = Pick<
  VoiceProfileView,
  "id" | "name" | "tone" | "sampleCount" | "isDefault" | "createdAt"
>;
