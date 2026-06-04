import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AnalyticsDashboard } from "@/components/custom/admin/analytics-dashboard";
import { AppShell } from "@/components/custom/app/app-shell";
import {
  getWorkspaceAnalyticsActivity,
  getWorkspaceAnalyticsCounts,
} from "@/lib/analytics/queries";
import { getPlatformAuthCounts } from "@/lib/analytics/platform-queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Thống kê · Vietnamese Eden",
};

export default async function AnalyticsPage() {
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
    workspaceCounts7d,
    workspaceCounts30d,
    activity7d,
    activity30d,
    authCounts7d,
    authCounts30d,
  ] = await Promise.all([
    getWorkspaceAnalyticsCounts(supabase, workspace.id, 7),
    getWorkspaceAnalyticsCounts(supabase, workspace.id, 30),
    getWorkspaceAnalyticsActivity(supabase, workspace.id, 7),
    getWorkspaceAnalyticsActivity(supabase, workspace.id, 30),
    getPlatformAuthCounts(7),
    getPlatformAuthCounts(30),
  ]);

  const errors = [
    workspaceCounts7d.error,
    workspaceCounts30d.error,
    activity7d.error,
    activity30d.error,
    authCounts7d.error,
    authCounts30d.error,
  ].filter((error): error is string => Boolean(error));

  return (
    <AppShell
      title="Thống kê"
      subtitle="Dashboard analytics aggregate cho admin workspace"
    >
      <AnalyticsDashboard
        workspaceName={workspace.name}
        workspaceCounts7d={workspaceCounts7d.rows}
        workspaceCounts30d={workspaceCounts30d.rows}
        activity7d={activity7d.rows}
        activity30d={activity30d.rows}
        platformAuthCounts7d={authCounts7d.counts}
        platformAuthCounts30d={authCounts30d.counts}
        errors={errors}
      />
    </AppShell>
  );
}
