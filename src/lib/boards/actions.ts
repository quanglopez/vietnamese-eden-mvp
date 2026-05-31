"use server";

import { revalidatePath } from "next/cache";

import { getBoardGradient, slugifyWorkspaceName } from "@/lib/boards/constants";
import { createClient } from "@/lib/supabase/server";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function createBoardAction(input: {
  workspaceId: string;
  name: string;
  description?: string;
}): Promise<ActionResult<{ id: string }>> {
  const name = input.name.trim();
  if (name.length < 2) {
    return { success: false, error: "Tên bảng phải có ít nhất 2 ký tự." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để tạo bảng." };
  }

  const { count } = await supabase
    .from("boards")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", input.workspaceId);

  const sortOrder = count ?? 0;
  const gradientClass = getBoardGradient(sortOrder, null);

  const { data, error } = await supabase
    .from("boards")
    .insert({
      workspace_id: input.workspaceId,
      name,
      description: input.description?.trim() || null,
      color: gradientClass,
      sort_order: sortOrder,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/boards");
  revalidatePath("/dashboard");

  return { success: true, data: { id: data.id } };
}

export async function createDefaultWorkspaceAction(): Promise<
  ActionResult<{ id: string; name: string }>
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để tạo workspace." };
  }

  const metadata = user.user_metadata as Record<string, unknown>;
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  const firstName = fullName?.trim().split(/\s+/)[0];
  const workspaceName = firstName
    ? `Workspace của ${firstName}`
    : "Workspace của tôi";

  const slugBase = slugifyWorkspaceName(workspaceName);
  const slug = `${slugBase}-${user.id.replace(/-/g, "").slice(0, 8)}`;

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      slug,
      owner_id: user.id,
    })
    .select("id, name")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/boards");
  revalidatePath("/dashboard");

  return { success: true, data: { id: data.id, name: data.name } };
}
