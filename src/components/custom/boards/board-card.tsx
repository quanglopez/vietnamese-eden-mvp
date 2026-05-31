"use client";

import Link from "next/link";

import { formatBoardUpdatedAt } from "@/lib/boards/constants";
import type { BoardListItem } from "@/types/boards";

type BoardCardProps = {
  board: BoardListItem;
};

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group rounded-2xl border border-border/60 bg-surface-elev p-5 hover:shadow-card transition"
    >
      <div
        className={`h-32 rounded-xl bg-gradient-to-br ${board.gradientClass} relative overflow-hidden flex items-end p-4`}
      >
        <span className="absolute top-3 left-3 text-3xl">{board.emoji}</span>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className="relative text-xs font-semibold text-white bg-black/30 backdrop-blur px-2 py-1 rounded-full">
          {board.contentCount} post
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-display font-bold text-lg truncate">{board.name}</div>
          {board.description ? (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {board.description}
            </p>
          ) : (
            <div className="text-xs text-muted-foreground mt-0.5">
              Cập nhật {formatBoardUpdatedAt(board.updatedAt)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
