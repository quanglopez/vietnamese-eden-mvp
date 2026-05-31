import type { SupabaseClient } from "@supabase/supabase-js";

import { parseStyleNotes } from "@/lib/voice/style-notes";
import type { Database } from "@/types/database";
import type { VoiceProfileListItem, VoiceProfileView } from "@/types/voice";

function mapVoiceRow(row: {
  id: string;
  workspace_id: string;
  user_id: string;
  name: string;
  tone: string | null;
  style_notes: string | null;
  sample_count: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}): VoiceProfileView | null {
  const style = parseStyleNotes(row.style_notes);
  if (!style || !row.tone) {
    return null;
  }

  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id,
    name: row.name,
    tone: row.tone,
    style,
    sampleCount: row.sample_count,
    isDefault: row.is_default,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listVoiceProfilesForUser(
  supabase: SupabaseClient<Database>,
  workspaceId: string,
  userId: string,
): Promise<{ profiles: VoiceProfileView[]; error: string | null }> {
  const { data, error } = await supabase
    .from("voice_profiles")
    .select(
      "id, workspace_id, user_id, name, tone, style_notes, sample_count, is_default, created_at, updated_at",
    )
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return { profiles: [], error: error.message };
  }

  const profiles = (data ?? [])
    .map((row) => mapVoiceRow(row))
    .filter((row): row is VoiceProfileView => row !== null);

  return { profiles, error: null };
}

export async function getVoiceProfileById(
  supabase: SupabaseClient<Database>,
  profileId: string,
  userId: string,
): Promise<{ profile: VoiceProfileView | null; error: string | null }> {
  const { data, error } = await supabase
    .from("voice_profiles")
    .select(
      "id, workspace_id, user_id, name, tone, style_notes, sample_count, is_default, created_at, updated_at",
    )
    .eq("id", profileId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return { profile: null, error: error.message };
  }
  if (!data) {
    return { profile: null, error: null };
  }

  return { profile: mapVoiceRow(data), error: null };
}

export function toVoiceListItem(profile: VoiceProfileView): VoiceProfileListItem {
  return {
    id: profile.id,
    name: profile.name,
    tone: profile.tone,
    sampleCount: profile.sampleCount,
    isDefault: profile.isDefault,
    createdAt: profile.createdAt,
  };
}
