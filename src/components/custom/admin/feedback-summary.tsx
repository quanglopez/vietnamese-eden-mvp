"use client";

import { useMemo } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WeeklySummaryCounts } from "@/lib/feedback/auto-classify";
import { labelForCategory } from "@/types/feedback";
import type { FeedbackCategory } from "@/types/feedback";

type FeedbackSummaryProps = {
  stats: WeeklySummaryCounts;
};

const CATEGORY_ORDER: FeedbackCategory[] = [
  "bug",
  "ux",
  "fr",
  "ai",
  "price",
  "positive",
];

export function FeedbackSummary({ stats }: FeedbackSummaryProps) {
  const categoryRows = useMemo(
    () =>
      CATEGORY_ORDER.map((cat) => ({
        cat,
        count: stats.byCategory[cat],
        label: labelForCategory(cat),
      })),
    [stats.byCategory],
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold">Tóm tắt 7 ngày</h2>
        <p className="text-xs text-muted-foreground">{stats.periodLabel}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Tổng mục
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Chưa phân loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.untriaged}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Đã phân loại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.triaged}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Đã xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.actioned}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Đã đóng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.closed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Theo danh mục</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {categoryRows.map((row) => (
              <div key={row.cat} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{row.label}</span>
                <span className="font-medium">{row.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Theo ưu tiên</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">P0</span>
              <span className="font-medium">{stats.byPriority.p0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P1</span>
              <span className="font-medium">{stats.byPriority.p1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P2</span>
              <span className="font-medium">{stats.byPriority.p2}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">P3</span>
              <span className="font-medium">{stats.byPriority.p3}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Chưa gán</span>
              <span className="font-medium">{stats.byPriority.unset}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
