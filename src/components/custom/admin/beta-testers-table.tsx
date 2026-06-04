"use client";

import { useMemo, useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

import { BetaTesterForm } from "@/components/custom/admin/beta-tester-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteBetaTesterAction } from "@/lib/beta-testers/actions";
import {
  labelForCoreFlowStatus,
  labelForFeedbackStatus,
  labelForInviteStatus,
  labelForPersona,
  labelForSignupStatus,
  type BetaTesterWithHint,
} from "@/types/beta-testers";

type BetaTestersTableProps = {
  workspaceId: string;
  workspaceName: string;
  testers: BetaTesterWithHint[];
  fetchError: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function BetaTestersTable({
  workspaceId,
  workspaceName,
  testers,
  fetchError,
}: BetaTestersTableProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTester, setEditingTester] = useState<BetaTesterWithHint | undefined>();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const countLabel = useMemo(() => {
    const n = testers.length;
    return `${n} tester${n === 1 ? "" : "s"}`;
  }, [testers.length]);

  function openCreate() {
    setFormMode("create");
    setEditingTester(undefined);
    setFormOpen(true);
  }

  function openEdit(tester: BetaTesterWithHint) {
    setFormMode("edit");
    setEditingTester(tester);
    setFormOpen(true);
  }

  function handleDelete(tester: BetaTesterWithHint) {
    const confirmed = window.confirm(
      `Xóa tester "${tester.email}" khỏi cohort? Hành động không hoàn tác.`,
    );
    if (!confirmed) return;

    setActionError(null);
    startTransition(async () => {
      const result = await deleteBetaTesterAction({
        testerId: tester.id,
        workspaceId,
      });
      if (!result.success) {
        setActionError(result.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">
            Workspace: <span className="font-medium text-foreground">{workspaceName}</span>
            {" · "}
            {countLabel}
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Thêm tester
        </Button>
      </div>

      {fetchError ? (
        <p className="text-sm text-destructive" role="alert">
          Không tải được danh sách: {fetchError}
        </p>
      ) : null}

      {actionError ? (
        <p className="text-sm text-destructive" role="alert">
          {actionError}
        </p>
      ) : null}

      {testers.length === 0 && !fetchError ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có tester nào. Nhấn &quot;Thêm tester&quot; để bắt đầu.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Họ tên</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Mời</TableHead>
                <TableHead>Đăng ký</TableHead>
                <TableHead>Core flow</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="hidden lg:table-cell">Cập nhật</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testers.map((tester) => (
                <TableRow key={tester.id}>
                  <TableCell className="font-medium max-w-[180px] truncate">
                    {tester.email}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate">
                    {tester.full_name ?? "—"}
                  </TableCell>
                  <TableCell>{labelForPersona(tester.persona)}</TableCell>
                  <TableCell>{labelForInviteStatus(tester.invite_status)}</TableCell>
                  <TableCell>{labelForSignupStatus(tester.signup_status)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span>{labelForCoreFlowStatus(tester.core_flow_status)}</span>
                      {tester.analyticsCoreFlowHint &&
                      tester.analyticsCoreFlowHint !== tester.core_flow_status ? (
                        <Badge variant="secondary" className="text-[10px] font-normal">
                          Analytics: {labelForCoreFlowStatus(tester.analyticsCoreFlowHint)}
                        </Badge>
                      ) : tester.analyticsCoreFlowHint ? (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          Khớp analytics
                        </Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>{labelForFeedbackStatus(tester.feedback_status)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(tester.updated_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Sửa tester"
                        onClick={() => openEdit(tester)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Xóa tester"
                        onClick={() => handleDelete(tester)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {testers.some((t) => t.notes) ? (
        <p className="text-xs text-muted-foreground">
          Ghi chú nội bộ: mở Sửa để xem/chỉnh (không hiển thị trên bảng để tránh lộ nội dung nhạy
          cảm).
        </p>
      ) : null}

      <BetaTesterForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspaceId}
        mode={formMode}
        tester={editingTester}
      />
    </div>
  );
}
