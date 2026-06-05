"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Info,
  LogIn,
  TrendingDown,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildAnalyticsFunnel,
  buildPersonaFunnels,
  countRowsToAnalyticsCounts,
  mergeAnalyticsCounts,
} from "@/lib/analytics/queries";
import type {
  AnalyticsActivityRow,
  AnalyticsEventCountRow,
  AnalyticsEventCounts,
} from "@/lib/analytics/queries";
import type { CohortEventRow } from "@/lib/analytics/cohort-queries";
import type { AnalyticsEventType } from "@/types/analytics";

import type { ConfidenceLevel } from "@/types/analytics";

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

type AnalyticsRange = 7 | 30 | "all";

type AnalyticsDashboardProps = {
  workspaceName: string;
  workspaceCounts7d: AnalyticsEventCountRow[];
  workspaceCounts30d: AnalyticsEventCountRow[];
  workspaceCountsAll: AnalyticsEventCountRow[];
  activity7d: AnalyticsActivityRow[];
  activity30d: AnalyticsActivityRow[];
  platformAuthCounts7d: Pick<AnalyticsEventCounts, "login" | "signup">;
  platformAuthCounts30d: Pick<AnalyticsEventCounts, "login" | "signup">;
  platformAuthCountsAll: Pick<AnalyticsEventCounts, "login" | "signup">;
  cohortRows: CohortEventRow[];
  cohortTotalAttributed: number;
  cohortTotalUnattributed: number;
  errors: string[];
};

const CONFIDENCE_BADGE: Record<ConfidenceLevel, { label: string; className: string }> = {
  high: { label: "Cao", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  medium: { label: "Trung bình", className: "bg-amber-100 text-amber-800 border-amber-200" },
  low: { label: "Thấp", className: "bg-red-100 text-red-800 border-red-200" },
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function getMaxActivity(rows: AnalyticsActivityRow[]) {
  return Math.max(...rows.map((row) => row.total), 1);
}

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: 7, label: "7 ngày" },
  { value: 30, label: "30 ngày" },
  { value: "all", label: "Tất cả" },
];

export function AnalyticsDashboard({
  workspaceName,
  workspaceCounts7d,
  workspaceCounts30d,
  workspaceCountsAll,
  activity7d,
  activity30d,
  platformAuthCounts7d,
  platformAuthCounts30d,
  platformAuthCountsAll,
  cohortRows,
  cohortTotalAttributed,
  cohortTotalUnattributed,
  errors,
}: AnalyticsDashboardProps) {
  const [range, setRange] = useState<AnalyticsRange>(7);

  const workspaceCounts =
    range === 7 ? workspaceCounts7d : range === 30 ? workspaceCounts30d : workspaceCountsAll;
  const activityRows = range === 7 ? activity7d : activity30d;
  const authCounts =
    range === 7 ? platformAuthCounts7d : range === 30 ? platformAuthCounts30d : platformAuthCountsAll;

  const combinedCounts = useMemo(
    () => mergeAnalyticsCounts(countRowsToAnalyticsCounts(workspaceCounts), authCounts),
    [authCounts, workspaceCounts],
  );
  const funnel = useMemo(() => buildAnalyticsFunnel(combinedCounts), [combinedCounts]);
  const maxActivity = getMaxActivity(activityRows);

  // Cohort / persona funnels — workspace-scoped events only (no platform auth merge)
  const personaFunnels = useMemo(
    () => buildPersonaFunnels(cohortRows),
    [cohortRows],
  );
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const filteredPersonaFunnels = useMemo(() => {
    if (!selectedPersona) return personaFunnels;
    return personaFunnels.filter((f) => f.persona === selectedPersona);
  }, [personaFunnels, selectedPersona]);

  const hasTesters = personaFunnels.length > 0;
  const hasUnattributed = cohortTotalUnattributed > 0;

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
          {RANGE_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              type="button"
              size="sm"
              variant={range === opt.value ? "default" : "ghost"}
              className="rounded-full px-4"
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
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
                  {platformWide ? "Platform-wide auth aggregate" : `Workspace trong ${range === "all" ? "toàn bộ thời gian" : `${range} ngày`}`}
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
            {range === "all" ? (
              <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
                <Info className="mr-2 h-4 w-4" />
                Biểu đồ hoạt động theo ngày chỉ hiển thị cho 7 và 30 ngày.
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ── Cohort / Persona section ────────────────────────────────────── */}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Phân tích theo cohort
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Funnel kích hoạt phân theo persona tester. Chỉ hiển thị khi tester đã được liên kết
            user_id với analytics events. Cohort hiện dùng cửa sổ 30 ngày.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Empty state */}
          {!hasTesters ? (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-muted-foreground/30 py-10 text-center">
              <Users className="h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                Chưa có tester nào trong workspace này.
              </p>
              <p className="text-xs text-muted-foreground">
                Thêm tester tại{" "}
                <span className="font-semibold">Quản tester</span> để bật phân tích
                cohort. Khi tester có user_id liên kết, dữ liệu analytics sẽ tự động
                được gán theo persona.
              </p>
            </div>
          ) : (
            <>
              {/* Persona filter pills */}
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={!selectedPersona ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedPersona(null)}
                >
                  Tất cả
                </Badge>
                {personaFunnels
                  .filter((f) => f.persona !== "Không xác định")
                  .map((f) => (
                    <Badge
                      key={f.persona}
                      variant={selectedPersona === f.persona ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() =>
                        setSelectedPersona(
                          selectedPersona === f.persona ? null : f.persona,
                        )
                      }
                    >
                      {f.persona} ({f.totalEvents})
                    </Badge>
                  ))}
                {hasUnattributed ? (
                  <Badge
                    variant={selectedPersona === "Không xác định" ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedPersona(
                        selectedPersona === "Không xác định" ? null : "Không xác định",
                      )
                    }
                  >
                    Không xác định ({cohortTotalUnattributed})
                  </Badge>
                ) : null}
              </div>

              {/* Per-persona funnels */}
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredPersonaFunnels.map((personaFunnel) => (
                  <Card key={personaFunnel.persona} className="border-border/60">
                    <CardContent className="space-y-3 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">
                          {personaFunnel.persona}
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                            (CONFIDENCE_BADGE[personaFunnel.confidence] ?? CONFIDENCE_BADGE.low).className
                          }`}
                        >
                          Độ tin cậy:{" "}
                          {(CONFIDENCE_BADGE[personaFunnel.confidence] ?? CONFIDENCE_BADGE.low).label}
                        </span>
                      </div>

                      {personaFunnel.steps.map((step) => {
                        const width =
                          personaFunnel.totalEvents > 0
                            ? Math.max(4, step.conversionRate)
                            : 0;
                        return (
                          <div key={step.eventType} className="space-y-1">
                            <div className="flex items-center justify-between gap-2 text-xs">
                              <span>{step.label}</span>
                              <span className="text-muted-foreground">
                                {formatNumber(step.count)} · {step.conversionRate}%
                              </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary/60"
                                style={{ width: `${width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Owner-friendly interpretation */}
              <Card className="border-sky-200 bg-sky-50 text-sky-950">
                <CardContent className="space-y-2 pt-3 text-sm">
                  <div className="flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Diễn giải cho owner
                  </div>

                  {personaFunnels.length === 0 ? null : (
                    <>
                      {(() => {
                        // Find the biggest drop-off step across all attributed personas
                        let maxDropOff = 0;
                        let dropOffStep = "";
                        for (const pf of personaFunnels) {
                          if (pf.persona === "Không xác định") continue;
                          for (const step of pf.steps) {
                            if (step.dropOffFromPrevious > maxDropOff) {
                              maxDropOff = step.dropOffFromPrevious;
                              dropOffStep = step.label;
                            }
                          }
                        }
                        return maxDropOff > 0 ? (
                          <p>
                            <span className="font-medium">
                              Người dùng rời bỏ nhiều nhất ở bước:
                            </span>{" "}
                            {dropOffStep} (drop-off {maxDropOff}%).
                          </p>
                        ) : (
                          <p>
                            <span className="font-medium">
                              Chưa đủ dữ liệu để xác định điểm rời bỏ.
                            </span>
                          </p>
                        );
                      })()}
                    </>
                  )}

                  <p>
                    <span className="font-medium">Hành động tiếp theo:</span>{" "}
                    {cohortTotalAttributed === 0
                      ? "Thêm tester và liên kết user_id để có dữ liệu cohort."
                      : cohortTotalAttributed < 3
                        ? "Cần thêm tester để tăng độ tin cậy của phân tích."
                        : "Theo dõi funnel theo persona để phát hiện nhóm tester gặp khó khăn ở bước nào."}
                  </p>

                  <div className="flex flex-col gap-1 pt-2 text-xs text-sky-700">
                    <p className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        <strong>Auth events (đăng nhập/đăng ký):</strong> platform-wide,
                        workspace_id=null. Không thể gán vào persona cụ thể.
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        <strong>Tester-user linking:</strong> chỉ tester có user_id mới
                        được gán dữ liệu. Tester chưa liên kết hiển thị trong nhóm
                        &ldquo;Không xác định&rdquo;.
                      </span>
                    </p>
                    <p className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>
                        <strong>Nguồn đăng ký:</strong> bảng beta_testers chưa có cột
                        source — không thể phân tích theo nguồn.
                      </span>
                    </p>
                    {cohortTotalAttributed > 0 && cohortTotalAttributed < 3 ? (
                      <p className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        <span>
                          <strong>Cỡ mẫu nhỏ:</strong> {"<"} 3 events được gán — độ tin
                          cậy thấp. Cần thêm dữ liệu để kết luận.
                        </span>
                      </p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
