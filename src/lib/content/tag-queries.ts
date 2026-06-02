import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { ManualTag } from "@/types/tags";

type TagRow = Database["public"]["Tables"]["tags"]["Row"];

function mapTag(row: TagRow): ManualTag {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
  };
}

export async function listTagsForWorkspace(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
): Promise<{ tags: ManualTag[]; error: string | null }> {
  const { data, error } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("workspace_id", workspaceId)
    .order("name", { ascending: true });

  if (error) {
    return { tags: [], error: error.message };
  }

  return { tags: (data ?? []).map((row) => mapTag(row as TagRow)), error: null };
}

export async function listTagsForContentItem(
  supabase: SupabaseClient<Database>,
  contentItemId: string,
): Promise<{ tags: ManualTag[]; error: string | null }> {
  const { data, error } = await supabase
    .from("content_item_tags")
    .select(
      `
      tags (
        id,
        name,
        color
      )
    `,
    )
    .eq("content_item_id", contentItemId);

  if (error) {
    return { tags: [], error: error.message };
  }

  const tags = (data ?? [])
    .map((row) => {
      const tag = (row as { tags: TagRow | null }).tags;
      return tag ? mapTag(tag) : null;
    })
    .filter((tag): tag is ManualTag => Boolean(tag));

  return { tags, error: null };
}

