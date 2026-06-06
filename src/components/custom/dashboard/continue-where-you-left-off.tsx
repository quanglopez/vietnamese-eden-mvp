"use client";

import Link from "next/link";
import { ArrowRight, Clock, Sparkles, Wand2, CalendarDays, FolderHeart } from "lucide-react";

import type { BoardFunnelStatus } from "@/lib/boards/continue-queries";
import { getNextAction } from "@/lib/boards/continue-queries";

type ContinueWhereYouLeftOffProps = {
  boards: BoardFunnelStatus[];
};

/**
 * Returns a funnel step label describing the board's current state.
 * Does not expose raw user content — only shows progress metadata.
 */
function getFunnelSummary(board: BoardFunnelStatus): string {
  if (board.contentCount === 0) {
    return "Chưa có nội dung";
  }
  if (!board.hasAnalysis) {
    return `${board.contentCount} nội dung · Chưa phân tích AI`;
  }
  if (!board.hasRemix) {
    return `${board.contentCount} nội dung · Đã phân tích`;
  }
  if (!board.hasCalendar) {
    return `${board.contentCount} nội dung · Đã tạo remix`;
  }
  return `${board.contentCount} nội dung · Hoàn tất`;
}

const stepIcons: Record<string, React.ElementType> = {
  "Thêm nội dung": FolderHeart,
  "Phân tích AI": Sparkles,
  "Tạo remix": Wand2,
  "Thêm vào lịch": CalendarDays,
  "Mở board": FolderHeart,
};

export function ContinueWhereYouLeftOff({
  boards,
}: ContinueWhereYouLeftOffProps) {
  if (boards.length === 0) {
    return null;
  }

  return (
    <section
      className="mb-8 rounded-2xl border border-brand/30 bg-gradient-brand-soft p-4 sm:p-6"
      aria-label="Tiếp tục từ lần trước"
      data-testid="continue-where-you-left-off"
    >
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5 text-brand" />
        <h2 className="font-display text-lg font-bold">
          Tiếp tục từ lần trước
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
        Tiếp tục nơi bạn đã dừng — hoàn thiện luồng Board → Content → Phân tích AI → Remix → Calendar.
      </p>
      <div className="space-y-3">
        {boards.map((board) => {
          const action = getNextAction(board);
          const Icon = stepIcons[action.label] ?? FolderHeart;
          return (
            <Link
              key={board.id}
              href={action.href}
              className="flex items-center gap-3 rounded-xl border border-border/80 bg-background/70 px-4 py-3 hover:border-brand/40 hover:shadow-sm transition group"
            >
              <div
                className={`h-10 w-10 rounded-lg bg-gradient-to-br ${board.gradientClass} grid place-items-center text-lg shrink-0`}
              >
                {board.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{board.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {getFunnelSummary(board)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5 rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-medium text-brand">
                  <Icon className="h-3.5 w-3.5" />
                  <span>{action.label}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-brand opacity-0 group-hover:opacity-100 transition shrink-0" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}