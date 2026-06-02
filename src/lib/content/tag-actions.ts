"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/boards/actions";
import { listTagsForContentItem, listTagsForWorkspace } from "@/lib/content/tag-queries";
import type { ManualTag } from "@/types/tags";

function normalizeTagName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export async function createTag(input: {
  workspaceId: string;
  name: string;
  color?: string | null;
  boardId?: string;
}): Promise<ActionResult<{ tag: ManualTag }>> {
  const supabase = createClient();
  const name = input.name.trim();

  if (name.length < 1) {
    return { success: false, error: "Tên tag không được để trống." };
  }

  const normalized = normalizeTagName(name);
  const { data: existing, error: existingError } = await supabase
    .from("tags")
    .select("id, name, color")
    .eq("workspace_id", input.workspaceId)
    .eq("name_normalized", normalized)
    .maybeSingle();

  if (existingError) {
    return { success: false, error: existingError.message };
  }

  if (existing) {
    return {
      success: true,
      data: { tag: { id: existing.id, name: existing.name, color: existing.color } },
    };
  }

  const { data, error } = await supabase
    .from("tags")
    .insert({
      workspace_id: input.workspaceId,
      name,
      name_normalized: normalized,
      color: input.color ?? null,
    })
    .select("id, name, color")
    .single();

  if (error || !data) {
    return { success: false, error: error?.message ?? "Không thể tạo tag." };
  }

  if (input.boardId) {
    revalidatePath(`/boards/${input.boardId}`);
  }

  return {
    success: true,
    data: { tag: { id: data.id, name: data.name, color: data.color } },
  };
}

export async function deleteTag(input: {
  tagId: string;
  boardId?: string;
}): Promise<ActionResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.from("tags").delete().eq("id", input.tagId);
  if (error) {
    return { success: false, error: error.message };
  }
  if (input.boardId) {
    revalidatePath(`/boards/${input.boardId}`);
  }
  return { success: true, data: null };
}

export async function assignTagToContent(input: {
  contentItemId: string;
  tagId: string;
  boardId?: string;
}): Promise<ActionResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.from("content_item_tags").upsert(
    {
      content_item_id: input.contentItemId,
      tag_id: input.tagId,
    },
    {
      onConflict: "content_item_id,tag_id",
      ignoreDuplicates: true,
    },
  );
  if (error) {
    return { success: false, error: error.message };
  }
  if (input.boardId) {
    revalidatePath(`/boards/${input.boardId}`);
  }
  return { success: true, data: null };
}

export async function removeTagFromContent(input: {
  contentItemId: string;
  tagId: string;
  boardId?: string;
}): Promise<ActionResult<null>> {
  const supabase = createClient();
  const { error } = await supabase
    .from("content_item_tags")
    .delete()
    .eq("content_item_id", input.contentItemId)
    .eq("tag_id", input.tagId);
  if (error) {
    return { success: false, error: error.message };
  }
  if (input.boardId) {
    revalidatePath(`/boards/${input.boardId}`);
  }
  return { success: true, data: null };
}

export async function listTagsForWorkspaceAction(input: {
  workspaceId: string;
}): Promise<ActionResult<{ tags: ManualTag[] }>> {
  const supabase = createClient();
  const { tags, error } = await listTagsForWorkspace(supabase, input.workspaceId);
  if (error) {
    return { success: false, error };
  }
  return { success: true, data: { tags } };
}

export async function listTagsForContentItemAction(input: {
  contentItemId: string;
}): Promise<ActionResult<{ tags: ManualTag[] }>> {
  const supabase = createClient();
  const { tags, error } = await listTagsForContentItem(supabase, input.contentItemId);
  if (error) {
    return { success: false, error };
  }
  return { success: true, data: { tags } };
}

