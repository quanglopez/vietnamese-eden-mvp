import type { Metadata } from "next";

import { DashboardView } from "@/components/custom/app/dashboard-view";
import type { OnboardingChecklistProgress } from "@/components/custom/dashboard/onboarding-checklist";
import { listBoardsForWorkspace, getWorkspaceContentCount } from "@/lib/boards/queries";
import { getWorkspaceAnalysisCount } from "@/lib/content/analysis-queries";
import { getWorkspaceRemixCount } from "@/lib/content/remix-queries";
import { createClient } from "@/lib/supabase/server";
import { listVoiceProfilesForUser } from "@/lib/voice/queries";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";
import { getWorkspaceCalendarCount } from "@/lib/calendar/queries";

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
  let checklistProgress: OnboardingChecklistProgress | null = null;
  let fetchError: string | null = null;

  if (user) {
    const { workspace, error: workspaceError } = await getCurrentWorkspace(supabase, user.id);
    if (workspaceError) {
      fetchError = workspaceError;
    } else if (workspace) {
      const [
        boardsResult,
        voiceResult,
        contentCount,
        analysisCount,
        remixCount,
        calendarCount,
      ] = await Promise.all([
        listBoardsForWorkspace(supabase, workspace.id),
        listVoiceProfilesForUser(supabase, workspace.id, user.id),
        getWorkspaceContentCount(supabase, workspace.id),
        getWorkspaceAnalysisCount(supabase, workspace.id),
        getWorkspaceRemixCount(supabase, workspace.id),
        getWorkspaceCalendarCount(supabase, workspace.id),
      ]);

      const queryErrors = [boardsResult.error, voiceResult.error].filter(
        (message): message is string => Boolean(message),
      );
      if (queryErrors.length > 0) {
        fetchError = queryErrors.join(" · ");
      }

      boards = boardsResult.boards;
      const hasBoard = boards.length > 0;
      const hasVoiceProfile = (voiceResult.profiles?.length ?? 0) > 0;

      const firstBoardId = boards.length > 0 ? (boards[0]?.id ?? null) : null;

      // Compute "next best action" deterministically from existing data only
      let nextBestAction: string | null = null;
      let nextBestActionHref = "/boards";
      if (!hasBoard) {
        nextBestAction = "Tạo board đầu tiên";
        nextBestActionHref = "/boards";
      } else if (contentCount === 0) {
        nextBestAction = "Dán bài content đầu tiên";
        nextBestActionHref = `/boards/${firstBoardId}`;
      } else if (analysisCount === 0) {
        nextBestAction = "Chạy AI Breakdown";
        nextBestActionHref = "/boards";
      } else if (remixCount === 0) {
        nextBestAction = "Tạo remix đầu tiên";
        nextBestActionHref = "/boards";
      } else if (calendarCount === 0) {
        nextBestAction = "Đưa output vào Calendar";
        nextBestActionHref = "/calendar";
      } else {
        nextBestAction = "Gửi feedback beta";
        nextBestActionHref = "/admin/feedback";
      }

      checklistProgress = {
        userId: user.id,
        workspaceId: workspace.id,
        steps: [
          {
            id: "board",
            label: "Tạo board đầu tiên",
            href: "/boards",
            done: hasBoard,
          },
          {
            id: "content",
            label: "Thêm content đầu tiên",
            href: "/boards",
            done: contentCount > 0,
          },
          {
            id: "breakdown",
            label: "Chạy phân tích AI",
            href: "/boards",
            done: analysisCount > 0,
          },
          {
            id: "remix",
            label: "Tạo remix đầu tiên",
            href: "/boards",
            done: remixCount > 0,
          },
          {
            id: "voice",
            label: "Thiết lập giọng văn",
            href: "/voice",
            done: hasVoiceProfile,
          },
        ],
        nextBestAction: nextBestAction
          ? { label: nextBestAction, href: nextBestActionHref }
          : null,
      };
    }
  }

  return (
    <DashboardView
      title={`Chào ${greetingName} 👋`}
      subtitle="Workspace AI content — beta MVP"
      boards={boards}
      checklistProgress={checklistProgress}
      fetchError={fetchError}
    />
  );
}
