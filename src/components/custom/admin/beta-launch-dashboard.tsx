"use client";

import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Circle,
  MessageSquare,
  Rocket,
  Send,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AnalyticsEventType } from "@/types/analytics";
import {
  BETA_INVITE_STATUS_OPTIONS,
  BETA_PERSONA_OPTIONS,
  labelForCoreFlowStatus,
  labelForFeedbackStatus,
  labelForInviteStatus,
  labelForPersona,
} from "@/types/beta-testers";
import type {
  BetaInviteStatus,
  BetaPersona,
  BetaTesterWithHint,
} from "@/types/beta-testers";
import type { BetaLaunchData } from "@/lib/beta-launch/queries";

const CHECKLIST_ITEMS = [
  "Gửi invite cho tester",
  "Tester đã đăng nhập",
  "Tester đã thêm content đầu tiên",
  "Tester đã test AI Breakdown",
  "Tester đã test Remix",
  "Tester đã test Calendar",
  "Đã thu thập phản hồi",
] as const;

const EVENT_LABELS: Partial<Record<AnalyticsEventType, string>> = {
  board_create: "Tạo board",
  content_add: "Thêm content",
  breakdown_run: "Chạy breakdown",
  remix_run: "Tạo remix",
  calendar_add: "Lên lịch",
};

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="bg-gradient-brand-soft border-border/60">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}

function needsFollowUp(tester: BetaTesterWithHint): boolean {
  return (
    tester.invite_status === "accepted" && tester.core_flow_status === "not_started"
  );
}

function LaunchOverviewCards({ data }: { data: BetaLaunchData }) {
  const invited =
    data.overview.byInviteStatus.invited + data.overview.byInviteStatus.accepted;
  const active =
    data.overview.byCoreFlowStatus.in_progress +
    data.overview.byCoreFlowStatus.completed +
    data.overview.byCoreFlowStatus.partial;
  const followUps = data.testers.filter(needsFollowUp).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <StatCard
        title="Tổng tester"
        value={data.overview.totalTesters}
        icon={Users}
      />
      <StatCard title="Đã mời / chấp nhận" value={invited} icon={Send} />
      <StatCard title="Đang test / active" value={active} icon={Activity} />
      <StatCard
        title="Hoàn thành core flow"
        value={data.overview.byCoreFlowStatus.completed}
        icon={CheckCircle2}
      />
      <StatCard
        title="Cần follow-up"
        value={followUps}
        icon={AlertCircle}
      />
      <StatCard title="Feedback entries" value={data.feedbackCount} icon={MessageSquare} />
    </div>
  );
}

function CohortBreakdownSection({ data }: { data: BetaLaunchData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theo Persona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BETA_PERSONA_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Badge variant="secondary">{data.cohort.byPersona[value]}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theo Trạng thái</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {BETA_INVITE_STATUS_OPTIONS.map(({ value, label }) => (
            <div key={value} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Badge variant="secondary">
                {data.cohort.byStatus[value as BetaInviteStatus]}
              </Badge>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/60 mt-2">
            {data.cohort.sourceNote}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ActivationSnapshotSection({ data }: { data: BetaLaunchData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đăng ký (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activation.platformAuth.signup}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đăng nhập (30d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.activation.platformAuth.login}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace Activity (30 ngày)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(EVENT_LABELS).map(([eventType, label]) => {
            const count =
              data.activation.workspaceEvents[eventType as AnalyticsEventType] ?? 0;
            return (
              <div key={eventType} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            );
          })}
          <p className="text-xs text-muted-foreground pt-2 border-t border-border/60 mt-2">
            Số liệu activation dựa trên analytics_events. Không phải tester nào cũng
            đã liên kết user_id → workspace. Đây là số tổng workspace, không phải
            per-tester.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SupportChecklistSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Support Checklist / Launch Ops</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm">
              <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground pt-3 mt-2 border-t border-border/60">
          Checklist thủ công — không tự động. Owner tự đánh dấu khi hoàn thành từng
          bước.
        </p>
      </CardContent>
    </Card>
  );
}

function TesterReadinessTable({ data }: { data: BetaLaunchData }) {
  if (data.testers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Danh sách tester</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-8 text-center">
            Chưa có tester nào.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Danh sách tester</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tên / Email</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Core Flow</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead>Cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.testers.map((tester) => (
                <TableRow key={tester.id}>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {tester.full_name ?? "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {tester.email}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {labelForPersona(tester.persona as BetaPersona)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">
                      {labelForInviteStatus(tester.invite_status as BetaInviteStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {labelForCoreFlowStatus(tester.core_flow_status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {labelForFeedbackStatus(tester.feedback_status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                    {tester.notes || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {tester.updated_at
                      ? new Date(tester.updated_at).toLocaleDateString("vi-VN")
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function BetaLaunchDashboard({
  data,
}: {
  data: BetaLaunchData;
  workspaceName: string;
}) {
  return (
    <div className="space-y-8">
      {data.errors.length > 0 ? (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-400">
              {data.errors.map((err, i) => (
                <div key={i}>{err}</div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Launch Overview
        </h2>
        <LaunchOverviewCards data={data} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Cohort / Persona / Status</h2>
        <CohortBreakdownSection data={data} />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-4">Activation Snapshot</h2>
        <ActivationSnapshotSection data={data} />
      </section>

      <TesterReadinessTable data={data} />

      <SupportChecklistSection />
    </div>
  );
}
