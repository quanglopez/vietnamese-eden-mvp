import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { FeedbackSummary } from "@/components/custom/admin/feedback-summary";
import { FeedbackTable } from "@/components/custom/admin/feedback-table";
import { AppShell } from "@/components/custom/app/app-shell";
import { listBetaTesters } from "@/lib/beta-testers/queries";
import { getFeedbackWeeklySummary, listFeedbackEntries } from "@/lib/feedback/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Phản hồi beta · Vietnamese Eden",
};

export default async function FeedbackAdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { workspace } = await getCurrentWorkspace(supabase, user.id);
  if (!workspace) {
    redirect("/dashboard");
  }

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspace.id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member || (member.role !== "owner" && member.role !== "admin")) {
    redirect("/dashboard");
  }

  const [
    { entries, error: entriesError },
    { stats, error: statsError },
    { testers: betaTesters },
  ] = await Promise.all([
    listFeedbackEntries(supabase, workspace.id),
    getFeedbackWeeklySummary(supabase, workspace.id),
    listBetaTesters(supabase, workspace.id),
  ]);

  const fetchError = entriesError ?? statsError;

  const testerOptions = betaTesters.map((t) => ({
    id: t.id,
    email: t.email,
    full_name: t.full_name,
  }));

  return (
    <AppShell
      title="Phản hồi beta"
      subtitle="Quản lý feedback cohort — chỉ owner/admin workspace"
    >
      <div className="space-y-8">
        <FeedbackSummary stats={stats} />
        <FeedbackTable
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          entries={entries}
          fetchError={fetchError}
          betaTesters={testerOptions}
        />
      </div>
    </AppShell>
  );
}
