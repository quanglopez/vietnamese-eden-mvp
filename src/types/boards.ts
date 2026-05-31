export type BoardRow = {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  color: string | null;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type BoardListItem = {
  id: string;
  name: string;
  description: string | null;
  contentCount: number;
  updatedAt: string;
  gradientClass: string;
  emoji: string;
};

export type WorkspaceSummary = Pick<WorkspaceRow, "id" | "name" | "slug">;

export type BoardDetail = {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  gradientClass: string;
  emoji: string;
  contentCount: number;
  createdAt: string;
  updatedAt: string;
};
