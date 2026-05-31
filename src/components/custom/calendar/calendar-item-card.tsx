"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Calendar, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  deleteCalendarItemAction,
  updateCalendarStatusAction,
} from "@/lib/calendar/actions";
import { CALENDAR_STATUS_OPTIONS } from "@/lib/calendar/constants";
import type { CalendarItemView, CalendarStatus } from "@/types/calendar";

const selectClassName =
  "h-8 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function formatScheduledAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      weekday: "short",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type CalendarItemCardProps = {
  item: CalendarItemView;
  onUpdated?: () => void;
};

export function CalendarItemCard({ item, onUpdated }: CalendarItemCardProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (status: CalendarStatus) => {
    startTransition(async () => {
      const result = await updateCalendarStatusAction(item.id, status);
      if (result.success) {
        onUpdated?.();
      }
    });
  };

  const handleDelete = () => {
    if (!window.confirm("Xóa mục này khỏi lịch?")) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCalendarItemAction(item.id);
      if (result.success) {
        onUpdated?.();
      }
    });
  };

  return (
    <article className="rounded-2xl border border-border/60 bg-surface-elev p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-display font-bold text-base">{item.title}</h3>
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
              {item.channelLabel}
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatScheduledAt(item.scheduledAt)}
            </span>
          </div>
          {item.contentItemId ? (
            <p className="text-xs text-muted-foreground mt-2">
              Nguồn remix:{" "}
              <Link
                href={`/remix/${item.contentItemId}`}
                className="text-brand hover:underline"
              >
                Xem output
              </Link>
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={item.status}
            onChange={(e) => handleStatusChange(e.target.value as CalendarStatus)}
            disabled={isPending}
            className={selectClassName}
            aria-label="Trạng thái"
          >
            {CALENDAR_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Xóa"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {item.contentPreview ? (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-4 line-clamp-4">
          {item.contentPreview}
        </p>
      ) : null}

      {item.userNotes ? (
        <p className="text-xs text-muted-foreground mt-3 italic">Ghi chú: {item.userNotes}</p>
      ) : null}

      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
        Nhắc lịch — không tự động đăng
      </div>
    </article>
  );
}
