"use client";

import { useMemo, useState } from "react";
import { Activity, BarChart3, LogIn, TrendingDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAnalyticsFunnel,
  countRowsToAnalyticsCounts,
  mergeAnalyticsCounts,
} from "@/lib/analytics/queries";
import type {
  AnalyticsActivityRow,
  AnalyticsEventCountRow,
  AnalyticsEventCounts,
} from "@/lib/analytics/queries";
import type { AnalyticsEventType } from "@/types/analytics";

const EVENT_LABELS: Record<AnalyticsEventType, string> = {
  signup: "Đăng ký",
  login: "Đăng nhập",
  board_create: "Tạo board",
  content_add: "Thêm content",
  breakdown_run: "Breakdown",
  remix_run: "Remix",
  calendar_add: "Lên lịch",
};

const COUNT_EVENTS: AnalyticsEventType[] = [
  "login",
  "board_create",
  "content_add",
  "breakdown_run",
  "remix_run",
  "calendar_add",
];

type AnalyticsRange = 7 | 30;

type AnalyticsDashboardProps = {
  workspaceName: string;
  workspaceCounts7d: AnalyticsEventCountRow[];
  workspaceCounts30d: AnalyticsEventCountRow[];
  activity7d: AnalyticsActivityRow[];
  activity30d: AnalyticsActivityRow[];
  platformAuthCounts7d: Pick<AnalyticsEventCounts, "login" | "signup">;
  platformAuthCounts30d: Pick<AnalyticsEventCounts, "login" | "signup">;
  errors: string[];
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getMaxActivity(rows: AnalyticsActivityRow[]) {
  return Math.max(...rows.map((row) => row.total), 1);
}

export function AnalyticsDashboard({
  workspaceName,
  workspaceCounts7d,
  workspaceCounts30d,
  activity7d,
  activity30d,
  platformAuthCounts7d,
  platformAuthCounts30d,
  errors,
}: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsRange>(7);

  const workspaceCounts = range === 7 ? workspaceCounts7d : workspaceCounts30d;
  const activityRows = range === 7 ? activity7d : activity30d;
  const authCounts = range === 7 ? platformAuthCounts7d : platformAuthCounts30d;

  const combinedCounts = useMemo(
    () => mergeAnalyticsCounts(countRowsToAnalyticsCounts(workspaceCounts), authCounts),
    [authCounts, workspaceCounts],
  );
  const funnel = useMemo(() => buildAnalyticsFunnel(combinedCounts), [combinedCounts]);
  const maxActivity = getMaxActivity(activityRows);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-gradient-brand-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Analytics MVP
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold">Thống kê beta</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Workspace: {workspaceName}. Dữ liệu chỉ là aggregate; không hiển thị metadata,
            email, user_id, content, title, AI output, token hoặc secret.
          </p>
        </div>
        <div className="flex rounded-full border border-border/70 bg-background/70 p-1">
          {[7, 30].map((days) => (
            <Button
              key={days}
              type="button"
              size="sm"
              variant={range === days ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setRange(days as AnalyticsRange)}
            >
              {days} ngày
            </Button>
          ))}
        </div>
      </div>

      {errors.length > 0 ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-950">
          <CardContent className="pt-1 text-sm">
            Một vài thống kê chưa tải được: {errors.join(" · ")}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-sky-200 bg-sky-50 text-sky-950">
        <CardContent className="pt-1 text-sm">
          <span className="font-semibold">Lưu ý auth:</span> đăng nhập/đăng ký là chỉ số
          platform-wide aggregate vì auth events có workspace_id = null. Các chỉ số còn lại là
          workspace-scoped cho {workspaceName}.
        </CardContent>
      </Card>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {COUNT_EVENTS.map((eventType) => {
          const platformWide = eventType === "login";
          return (
            <Card key={eventType}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                  {EVENT_LABELS[eventType]}
                  {platformWide ? <LogIn className="h-4 w-4 text-sky-600" /> : <BarChart3 className="h-4 w-4 text-primary" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="font-display text-3xl font-bold">
                  {formatNumber(combinedCounts[eventType])}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {platformWide ? "Platform-wide auth aggregate" : `Workspace trong ${range} ngày`}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" /> Funnel kích hoạt
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.map((step) => {
              const width = combinedCounts.login > 0 ? Math.max(6, step.conversionRate) : 0;
              return (
                <div key={step.eventType} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground">
                      {formatNumber(step.count)} · {step.conversionRate}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-gradient-brand"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Drop-off từ bước trước: {step.dropOffFromPrevious}%
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Hoạt động theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex h-56 items-end gap-1 overflow-x-auto pb-2 sm:gap-2">
              {activityRows.map((row) => {
                const height = row.total > 0 ? Math.max(10, Math.round((row.total / maxActivity) * 100)) : 4;
                return (
                  <div key={row.date} className="flex min-w-8 flex-1 flex-col items-center gap-2">
                    <div className="flex h-40 w-full items-end rounded-full bg-muted/60 px-1">
                      <div
                        className="w-full rounded-full bg-foreground"
                        title={`${row.date}: ${row.total} events`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <div className="text-center text-[10px] leading-tight text-muted-foreground">
                      <div>{row.date.slice(5)}</div>
                      <div className="font-semibold text-foreground">{row.total}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Activity chart chỉ dùng event_type + created_at, không đọc metadata.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
