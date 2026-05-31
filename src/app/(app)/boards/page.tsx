import type { Metadata } from "next";

import { BoardsListView } from "@/components/custom/boards/boards-list-view";
import { listBoardsForWorkspace } from "@/lib/boards/queries";
import { createClient } from "@/lib/supabase/server";
import { getCurrentWorkspace } from "@/lib/workspaces/queries";

export const metadata: Metadata = {
  title: "Bảng cảm hứng · Vietnamese Eden",
};

export default async function BoardsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <BoardsListView
        workspace={null}
        boards={[]}
        fetchError="Bạn cần đăng nhập để xem bảng cảm hứng."
      />
    );
  }

  const { workspace, error: workspaceError } = await getCurrentWorkspace(
    supabase,
    user.id,
  );

  if (workspaceError) {
    return (
      <BoardsListView workspace={null} boards={[]} fetchError={workspaceError} />
    );
  }

  if (!workspace) {
    return <BoardsListView workspace={null} boards={[]} fetchError={null} />;
  }

  const { boards, error: boardsError } = await listBoardsForWorkspace(
    supabase,
    workspace.id,
  );

  return (
    <BoardsListView
      workspace={workspace}
      boards={boards}
      fetchError={boardsError}
    />
  );
}
