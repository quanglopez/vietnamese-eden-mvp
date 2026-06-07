"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CalendarDays, Info, LayoutGrid, List } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { FetchErrorBanner } from "@/components/custom/app/fetch-error-banner";
import { CalendarItemCard } from "@/components/custom/calendar/calendar-item-card";
import {
  CalendarWeeklyDetailList,
  CalendarWeeklyView,
} from "@/components/custom/calendar/calendar-weekly-view";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CALENDAR_AUTO_POST_NOTICE } from "@/lib/calendar/constants";
import { getWeekStartMonday, splitUpcomingAndPast } from "@/lib/calendar/queries";
import type { CalendarItemView } from "@/types/calendar";

type CalendarViewProps = {
  items: CalendarItemView[];
  fetchError: string | null;
};

export function CalendarView({ items, fetchError }: CalendarViewProps) {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const start = getWeekStartMonday(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return start;
  }, [weekOffset]);

  const { upcoming, past } = useMemo(() => splitUpcomingAndPast(items), [items]);

  return (
    <AppShell
      title="Lịch nội dung"
      subtitle="Lên lịch đăng nội dung — bạn vẫn tự đăng thủ công trên MXH"
    >
      {fetchError ? (
        <FetchErrorBanner message={`Không tải được lịch: ${fetchError}`} />
      ) : null}

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
          <CalendarDays className="h-12 w-12 text-brand mx-auto mb-4" />
          <p className="font-display font-bold text-lg">Chưa có nội dung nào trong lịch</p>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Tạo remix từ board, rồi bấm &quot;Đưa vào lịch&quot; để lên kế hoạch đăng.
            Bạn vẫn phải tự đăng thủ công trên từng nền tảng — Calendar chỉ là công cụ nhắc lịch.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <Button asChild variant="default">
              <Link href="/boards">Đi tới Boards</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand/10 px-3 py-2 text-xs text-brand">
            <Info className="h-4 w-4 shrink-0" />
            <span>{CALENDAR_AUTO_POST_NOTICE}</span>
          </div>
        </div>
      ) : (
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming" className="gap-2">
              <List className="h-4 w-4" />
              Sắp tới ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="weekly" className="gap-2">
              <LayoutGrid className="h-4 w-4" />
              Tuần này
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Không có mục sắp tới.</p>
            ) : (
              <div className="space-y-4">
                {upcoming.map((item) => (
                  <CalendarItemCard
                    key={item.id}
                    item={item}
                    onUpdated={() => router.refresh()}
                  />
                ))}
              </div>
            )}

            {past.length > 0 ? (
              <div>
                <h2 className="font-display font-bold text-sm text-muted-foreground mb-3">
                  Đã qua ({past.length})
                </h2>
                <div className="space-y-4 opacity-80">
                  {past.map((item) => (
                    <CalendarItemCard
                      key={item.id}
                      item={item}
                      onUpdated={() => router.refresh()}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset((o) => o - 1)}
              >
                ← Tuần trước
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset(0)}
              >
                Tuần hiện tại
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setWeekOffset((o) => o + 1)}
              >
                Tuần sau →
              </Button>
            </div>
            <CalendarWeeklyView
              items={items}
              weekStart={weekStart}
              onUpdated={() => router.refresh()}
            />
            <CalendarWeeklyDetailList
              items={items}
              weekStart={weekStart}
              onUpdated={() => router.refresh()}
            />
          </TabsContent>
        </Tabs>
      )}
    </AppShell>
  );
}
