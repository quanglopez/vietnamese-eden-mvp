import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/custom/app/app-shell";
import { SmokeDashboard } from "@/components/custom/admin/smoke-dashboard";
import { getSmokeSnapshot } from "@/lib/admin/smoke-queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Production Smoke · Vietnamese Eden",
};

export const dynamic = "force-dynamic";

export default async function SmokePage() {
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

  const snapshot = await getSmokeSnapshot();

  return (
    <AppShell
      title="Production Smoke"
      subtitle="Ingestion · Breakdown · Publish pipeline real-time status"
    >
      <SmokeDashboard snapshot={snapshot} />
    </AppShell>
  );
}
