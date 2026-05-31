import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RemixView } from "@/components/custom/remix/remix-view";
import { getRemixPageContext, listGeneratedOutputsByItemId } from "@/lib/content/remix-queries";
import { listVoiceProfilesForUser, toVoiceListItem } from "@/lib/voice/queries";
import { createClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/boards/utils";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

type RemixItemPageProps = {
  params: { contentItemId: string };
};

export const metadata: Metadata = {
  title: "Remix Generator · Vietnamese Eden",
  description: "Tạo biến thể nội dung từ AI breakdown",
};

export default async function RemixItemPage({ params }: RemixItemPageProps) {
  const { contentItemId } = params;

  if (!isValidUuid(contentItemId)) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { context, error: contextError } = await getRemixPageContext(supabase, contentItemId);

  if (!context) {
    notFound();
  }

  const { outputs, error: outputsError } = await listGeneratedOutputsByItemId(
    supabase,
    contentItemId,
  );

  let voiceProfiles: ReturnType<typeof toVoiceListItem>[] = [];
  let voiceError: string | null = null;

  if (user) {
    const { workspace } = await getCurrentWorkspace(supabase, user.id);
    if (workspace) {
      const { profiles, error } = await listVoiceProfilesForUser(
        supabase,
        workspace.id,
        user.id,
      );
      voiceProfiles = profiles.map(toVoiceListItem);
      voiceError = error;
    }
  }

  const fetchError =
    [contextError, outputsError, voiceError].filter(Boolean).join(" ") || null;

  return (
    <RemixView
      context={context}
      outputs={outputs}
      voiceProfiles={voiceProfiles}
      fetchError={fetchError}
    />
  );
}
