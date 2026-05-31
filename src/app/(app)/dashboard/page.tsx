import type { Metadata } from "next";

import { DashboardView } from "@/components/custom/app/dashboard-view";
import { listBoardsForWorkspace } from "@/lib/boards/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Tổng quan · Vietnamese Eden",
};

function getGreetingName(fullName: string | null): string {
  if (fullName) {
    const first = fullName.trim().split(/\s+/)[0];
    return first ?? "bạn";
  }
  return "bạn";
}

function getUserDisplayName(metadata: Record<string, unknown>): string | null {
  if (typeof metadata.full_name === "string") {
    return metadata.full_name;
  }
  if (typeof metadata.name === "string") {
    return metadata.name;
  }
  return null;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = getUserDisplayName(metadata);
  const greetingName = getGreetingName(fullName);

  let boards: Awaited<ReturnType<typeof listBoardsForWorkspace>>["boards"] = [];
  if (user) {
    const { workspace } = await getCurrentWorkspace(supabase, user.id);
    if (workspace) {
      const result = await listBoardsForWorkspace(supabase, workspace.id);
      boards = result.boards;
    }
  }

  return (
    <DashboardView
      title={`Chào ${greetingName} 👋`}
      subtitle="Workspace AI content — beta MVP"
      boards={boards}
    />
  );
}
