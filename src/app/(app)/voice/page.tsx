import type { Metadata } from "next";

import { VoiceView } from "@/components/custom/voice/voice-view";
import { listVoiceProfilesForUser } from "@/lib/voice/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Giọng văn · Vietnamese Eden",
  description: "Voice Profile — huấn luyện giọng viết cho AI",
};

export default async function VoicePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <VoiceView profiles={[]} fetchError="Bạn cần đăng nhập để xem voice profiles." />
    );
  }

  const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);

  if (workspaceError) {
    return <VoiceView profiles={[]} fetchError={workspaceError} />;
  }

  if (!workspace) {
    return (
      <VoiceView
        profiles={[]}
        fetchError="Không tìm thấy workspace. Hãy tham gia hoặc tạo workspace trước."
      />
    );
  }

  const { profiles, error: profilesError } = await listVoiceProfilesForUser(
    supabase,
    workspace.id,
    user.id,
  );

  return <VoiceView profiles={profiles} fetchError={profilesError} />;
}
