export type Tag = {
  id: string;
  name: string;
  color: string | null;
};

export type ContentItemTag = {
  contentItemId: string;
  tagId: string;
  createdAt: string;
};

export type ManualTag = Tag;

