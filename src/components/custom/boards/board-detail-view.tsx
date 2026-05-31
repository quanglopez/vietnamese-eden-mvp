"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Filter,
  FolderOpen,
  Grid3x3,
  List,
  Plus,
  Share2,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";
import { formatBoardUpdatedAt } from "@/lib/boards/constants";
import type { BoardDetail } from "@/types/boards";
import type { BoardContentItem } from "@/types/content";

import { AddContentTextModal } from "./add-content-text-modal";
import { ContentItemCard } from "./content-item-card";

type BoardDetailViewProps = {
  board: BoardDetail;
  items: BoardContentItem[];
  fetchError: string | null;
};

export function BoardDetailView({ board, items, fetchError }: BoardDetailViewProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const subtitle = `${board.contentCount} nội dung đã lưu · Cập nhật ${formatBoardUpdatedAt(board.updatedAt)}`;

  const handleAddSuccess = (message: string) => {
    setSuccessMessage(message);
    router.refresh();
  };

  return (
    <AppShell title={board.name} subtitle={subtitle}>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href="/boards">
            <ArrowLeft className="h-4 w-4" />
            Quay lại bảng cảm hứng
          </Link>
        </Button>
      </div>

      {fetchError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Không tải được nội dung: {fetchError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/30 bg-gradient-brand-soft px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <p className="flex-1 text-foreground">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div
        className={`rounded-3xl bg-gradient-to-br ${board.gradientClass} p-8 mb-8 text-white relative overflow-hidden`}
      >
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-5xl mb-3">{board.emoji}</div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{board.name}</h1>
            <p className="mt-2 text-white/85 max-w-xl">
              {board.description ??
                "Bộ sưu tập nội dung viral để phân tích công thức và remix mỗi tuần."}
            </p>
            <p className="mt-3 text-xs text-white/70">
              Tạo {new Date(board.createdAt).toLocaleDateString("vi-VN")} ·{" "}
              {board.contentCount} mục
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled
              title="Sắp ra mắt"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent gap-2"
            >
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-white text-foreground hover:bg-white/90 gap-2"
            >
              <Plus className="h-4 w-4" /> Thêm content
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-3.5 w-3.5" /> Tất cả nền tảng
        </Button>
        <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
          TikTok
        </Button>
        <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
          Instagram
        </Button>
        <Button variant="outline" size="sm" disabled title="Sắp ra mắt">
          YouTube
        </Button>
        <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Lưới">
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled
            title="Sắp ra mắt"
            aria-label="Danh sách"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface-elev/50 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand-soft grid place-items-center mb-4">
            <FolderOpen className="h-7 w-7 text-brand" />
          </div>
          <h2 className="font-display text-xl font-bold">Chưa có nội dung nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thêm link hoặc caption đầu tiên vào bảng này để bắt đầu phân tích và remix.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-6 bg-gradient-brand text-white shadow-glow gap-2"
          >
            <Sparkles className="h-4 w-4" /> Thêm content
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <ContentItemCard key={item.id} item={item} />
          ))}
        </div>
      )}

      <AddContentTextModal
        boardId={board.id}
        boardName={board.name}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleAddSuccess}
      />
    </AppShell>
  );
}
