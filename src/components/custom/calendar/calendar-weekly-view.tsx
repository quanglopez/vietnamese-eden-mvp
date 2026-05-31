"use client";

import { CalendarItemCard } from "@/components/custom/calendar/calendar-item-card";
import { groupItemsByWeekDay } from "@/lib/calendar/queries";
import type { CalendarItemView } from "@/types/calendar";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

type CalendarWeeklyViewProps = {
  items: CalendarItemView[];
  weekStart: Date;
  onUpdated?: () => void;
};

function formatDayHeader(weekStart: Date, dayIndex: number): string {
  const d = new Date(weekStart);
  d.setDate(d.getDate() + dayIndex);
  return new Intl.DateTimeFormat("vi-VN", { day: "numeric", month: "short" }).format(d);
}

export function CalendarWeeklyView({ items, weekStart }: CalendarWeeklyViewProps) {
  const groups = groupItemsByWeekDay(items, weekStart);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {DAY_LABELS.map((label, index) => {
        const dayItems = groups[index] ?? [];
        return (
          <div
            key={label}
            className="rounded-xl border border-border/60 bg-muted/20 min-h-[120px] p-3"
          >
            <div className="text-xs font-semibold text-brand mb-1">
              {label} · {formatDayHeader(weekStart, index)}
            </div>
            {dayItems.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Trống</p>
            ) : (
              <ul className="space-y-2">
                {dayItems.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-lg bg-surface-elev border border-border/40 p-2 text-xs"
                  >
                    <p className="font-semibold line-clamp-2">{item.title}</p>
                    <p className="text-muted-foreground mt-1">{item.channelLabel}</p>
                    <a
                      href={`#cal-${item.id}`}
                      className="text-brand text-[10px] mt-1 inline-block"
                      onClick={(e) => e.preventDefault()}
                    >
                      {new Intl.DateTimeFormat("vi-VN", { timeStyle: "short" }).format(
                        new Date(item.scheduledAt),
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CalendarWeeklyDetailList({
  items,
  weekStart,
  onUpdated,
}: CalendarWeeklyViewProps) {
  const groups = groupItemsByWeekDay(items, weekStart);
  const weekItems = Object.values(groups).flat();

  if (weekItems.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Không có mục nào trong tuần này.
      </p>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {weekItems.map((item) => (
        <div key={item.id} id={`cal-${item.id}`}>
          <CalendarItemCard item={item} onUpdated={onUpdated} />
        </div>
      ))}
    </div>
  );
}
