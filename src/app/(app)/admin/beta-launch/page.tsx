import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BetaLaunchDashboard } from "@/components/custom/admin/beta-launch-dashboard";
import { AppShell } from "@/components/custom/app/app-shell";
import { getBetaLaunchData } from "@/lib/beta-launch/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Beta Launch · Vietnamese Eden",
};

export default async function BetaLaunchPage() {
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

  const data = await getBetaLaunchData(supabase, workspace.id);

  return (
    <AppShell
      title="Beta Launch Command Center"
      subtitle="Tổng quan sẵn sàng ra mắt beta — chỉ owner/admin workspace"
    >
      <BetaLaunchDashboard data={data} workspaceName={workspace.name} />
    </AppShell>
  );
}
