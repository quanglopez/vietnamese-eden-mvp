"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderHeart, Loader2, Plus, Search, Sparkles } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { FetchErrorBanner } from "@/components/custom/app/fetch-error-banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDefaultWorkspaceAction } from "@/lib/boards/actions";
import type { BoardListItem, WorkspaceSummary } from "@/types/boards";

import { BoardCard } from "./board-card";
import { CreateBoardDialog } from "./create-board-dialog";

type BoardsListViewProps = {
  workspace: WorkspaceSummary | null;
  boards: BoardListItem[];
  fetchError: string | null;
};

export function BoardsListView({
  workspace,
  boards,
  fetchError,
}: BoardsListViewProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSettingUp, startSetup] = useTransition();

  const filteredBoards = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return boards;
    }
    return boards.filter(
      (board) =>
        board.name.toLowerCase().includes(query) ||
        board.description?.toLowerCase().includes(query),
    );
  }, [boards, search]);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleCreateWorkspace = () => {
    setSetupError(null);
    startSetup(async () => {
      const result = await createDefaultWorkspaceAction();
      if (!result.success) {
        setSetupError(result.error);
        return;
      }
      router.refresh();
    });
  };

  if (!workspace) {
    return (
      <AppShell
        title="Bảng cảm hứng"
        subtitle="Thiết lập workspace trước khi tạo bảng cảm hứng."
      >
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-xl">
          <div className="h-12 w-12 rounded-xl bg-gradient-brand grid place-items-center shadow-glow mb-4">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold">Chưa có workspace</h2>
          <p className="mt-3 text-muted-foreground">
            Tài khoản của bạn chưa thuộc workspace nào. Tạo workspace mặc định để bắt đầu lưu
            bài viral và tổ chức bảng cảm hứng.
          </p>
          {setupError ? (
            <p className="mt-3 text-sm text-destructive">{setupError}</p>
          ) : null}
          <Button
            onClick={handleCreateWorkspace}
            disabled={isSettingUp}
            className="mt-6 bg-gradient-brand text-white shadow-glow gap-2"
          >
            {isSettingUp ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Tạo workspace
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Bảng cảm hứng"
      subtitle={`${workspace.name} · Tổ chức ý tưởng viral theo niche, client, campaign.`}
    >
      {fetchError ? (
        <FetchErrorBanner message={`Không tải được danh sách bảng: ${fetchError}`} />
      ) : null}

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm bảng…"
            className="pl-9 bg-surface-elev h-11"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="default" size="sm" className="bg-foreground text-background">
            Tất cả
          </Button>
          <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
            Cá nhân
          </Button>
          <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
            Team
          </Button>
          <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
            Client
          </Button>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="bg-gradient-brand text-white gap-2 ml-auto shadow-glow"
        >
          <Plus className="h-4 w-4" /> Bảng mới
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface-elev/50 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand-soft grid place-items-center mb-4">
            <FolderHeart className="h-7 w-7 text-brand" />
          </div>
          <h2 className="font-display text-xl font-bold">Chưa có bảng nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tạo bảng đầu tiên để gom hook viral, bài tham khảo và ý tưởng remix theo từng
            chủ đề.
          </p>
          <Button
            onClick={() => setCreateOpen(true)}
            className="mt-6 bg-gradient-brand text-white shadow-glow gap-2"
          >
            <Plus className="h-4 w-4" /> Tạo bảng mới
          </Button>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 text-center max-w-md mx-auto">
          <p className="text-muted-foreground">
            Không tìm thấy bảng phù hợp với &quot;{search}&quot;.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBoards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-2xl border-2 border-dashed border-border bg-transparent p-5 grid place-items-center text-muted-foreground hover:border-brand hover:text-brand transition min-h-[220px]"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 mx-auto" />
              <div className="mt-2 font-display font-semibold">Tạo bảng mới</div>
            </div>
          </button>
        </div>
      )}

      <CreateBoardDialog
        workspaceId={workspace.id}
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={handleRefresh}
      />
    </AppShell>
  );
}
