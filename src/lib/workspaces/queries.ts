import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import type { WorkspaceSummary } from "@/types/boards";

type WorkspaceMemberRow = {
  workspace_id: string;
  workspaces: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function getCurrentWorkspace(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<{ workspace: WorkspaceSummary | null; error: string | null }> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      workspaces (
        id,
        name,
        slug
      )
    `,
    )
    .eq("user_id", userId)
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { workspace: null, error: error.message };
  }

  const row = data as WorkspaceMemberRow | null;
  const workspace = row?.workspaces;

  if (!workspace) {
    return { workspace: null, error: null };
  }

  return {
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
    },
    error: null,
  };
}
