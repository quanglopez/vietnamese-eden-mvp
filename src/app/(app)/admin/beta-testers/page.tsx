import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BetaTestersTable } from "@/components/custom/admin/beta-testers-table";
import { AppShell } from "@/components/custom/app/app-shell";
import { listBetaTestersWithHints } from "@/lib/beta-testers/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Quản tester · Vietnamese Eden",
};

export default async function BetaTestersPage() {
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

  const { testers, error } = await listBetaTestersWithHints(supabase, workspace.id);

  return (
    <AppShell
      title="Quản tester"
      subtitle="Theo dõi cohort beta — chỉ owner/admin workspace"
    >
      <BetaTestersTable
        workspaceId={workspace.id}
        workspaceName={workspace.name}
        testers={testers}
        fetchError={error}
      />
    </AppShell>
  );
}
