import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/custom/app/app-shell";
import { BoardDetailView } from "@/components/custom/boards/board-detail-view";
import {
  getBoardById,
  listBoardContentItems,
} from "@/lib/boards/queries";
import { getSavedViewsForBoard } from "@/lib/boards/saved-views-queries";
import { listTagsForWorkspace } from "@/lib/content/tag-queries";
import { isValidUuid } from "@/lib/boards/utils";
import { createClient } from "@/lib/supabase/server";

type BoardDetailPageProps = {
  params: { boardId: string };
};

export async function generateMetadata({
  params,
}: BoardDetailPageProps): Promise<Metadata> {
  if (!isValidUuid(params.boardId)) {
    return { title: "Không tìm thấy bảng · Vietnamese Eden" };
  }

  const supabase = createClient();
  const { board } = await getBoardById(supabase, params.boardId);

  return {
    title: board
      ? `${board.name} · Vietnamese Eden`
      : "Không tìm thấy bảng · Vietnamese Eden",
  };
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  if (!isValidUuid(params.boardId)) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { board, error: boardError } = await getBoardById(supabase, params.boardId);

  if (boardError) {
    return (
      <AppShell title="Bảng cảm hứng" subtitle="Không thể tải bảng">
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Lỗi khi tải bảng: {boardError}
        </div>
      </AppShell>
    );
  }

  if (!board) {
    notFound();
  }

  const [{ items, error: itemsError }, { tags: workspaceTags, error: tagsError }, savedViewsResult] =
    await Promise.all([
      listBoardContentItems(supabase, params.boardId),
      listTagsForWorkspace(supabase, board.workspaceId),
      getSavedViewsForBoard(supabase, params.boardId),
    ]);
  const mergedError =
    [itemsError, tagsError, savedViewsResult.error].filter(Boolean).join(" ") || null;

  return (
    <BoardDetailView
      board={board}
      items={items}
      workspaceTags={workspaceTags}
      savedViews={savedViewsResult.views}
      fetchError={mergedError}
    />
  );
}
