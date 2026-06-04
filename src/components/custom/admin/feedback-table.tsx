"use client";

import { useMemo, useState, useTransition } from "react";
import { FileInput, Pencil, Plus, Trash2 } from "lucide-react";

import { FeedbackForm } from "@/components/custom/admin/feedback-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { importFeedbackEntriesAction, deleteFeedbackEntryAction } from "@/lib/feedback/actions";
import {
  labelForCategory,
  labelForPriority,
  labelForSource,
  labelForStatus,
  truncateSummary,
  type FeedbackCategory,
  type FeedbackEntryRow,
  type FeedbackPriority,
  type FeedbackStatus,
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
} from "@/types/feedback";
import type { BetaTesterRow } from "@/types/beta-testers";

const selectClassName =
  "flex h-9 rounded-md border border-input bg-background px-2 py-1 text-sm";

type FeedbackTableProps = {
  workspaceId: string;
  workspaceName: string;
  entries: FeedbackEntryRow[];
  fetchError: string | null;
  betaTesters: Pick<BetaTesterRow, "id" | "email" | "full_name">[];
};

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export function FeedbackTable({
  workspaceId,
  workspaceName,
  entries,
  fetchError,
  betaTesters,
}: FeedbackTableProps) {
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");
  type PriorityFilter = NonNullable<FeedbackPriority> | "all" | "unset";
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingEntry, setEditingEntry] = useState<FeedbackEntryRow | undefined>();
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
      if (priorityFilter === "unset" && e.priority !== null) return false;
      if (
        priorityFilter !== "all" &&
        priorityFilter !== "unset" &&
        e.priority !== priorityFilter
      ) {
        return false;
      }
      return true;
    });
  }, [entries, statusFilter, categoryFilter, priorityFilter]);

  function openCreate() {
    setFormMode("create");
    setEditingEntry(undefined);
    setFormOpen(true);
  }

  function openEdit(entry: FeedbackEntryRow) {
    setFormMode("edit");
    setEditingEntry(entry);
    setFormOpen(true);
  }

  function handleDelete(entry: FeedbackEntryRow) {
    const confirmed = window.confirm(
      "Xóa mục phản hồi này? Hành động không hoàn tác.",
    );
    if (!confirmed) return;

    setActionError(null);
    startTransition(async () => {
      const result = await deleteFeedbackEntryAction({
        entryId: entry.id,
        workspaceId,
      });
      if (!result.success) {
        setActionError(result.error);
      }
    });
  }

  function handleImport() {
    setActionError(null);
    setImportMessage(null);
    startTransition(async () => {
      const result = await importFeedbackEntriesAction({
        workspaceId,
        text: importText,
        defaultSource: "google_form",
      });
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      setImportMessage(
        `Đã nhập ${result.data.created} mục${result.data.skipped > 0 ? `, bỏ qua ${result.data.skipped}` : ""}.`,
      );
      setImportText("");
      setImportOpen(false);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Workspace: <span className="font-medium text-foreground">{workspaceName}</span>
          {" · "}
          {filtered.length}/{entries.length} mục
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-2">
            <FileInput className="h-4 w-4" />
            Nhập từ Sheet
          </Button>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm phản hồi
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <select
          aria-label="Lọc trạng thái"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | "all")}
          className={selectClassName}
        >
          <option value="all">Tất cả trạng thái</option>
          {FEEDBACK_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc danh mục"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as FeedbackCategory | "all")}
          className={selectClassName}
        >
          <option value="all">Tất cả danh mục</option>
          {FEEDBACK_CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          aria-label="Lọc ưu tiên"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
          className={selectClassName}
        >
          <option value="all">Tất cả ưu tiên</option>
          <option value="unset">Chưa gán ưu tiên</option>
          {FEEDBACK_PRIORITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
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
      {importMessage ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400" role="status">
          {importMessage}
        </p>
      ) : null}

      {entries.length === 0 && !fetchError ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Chưa có phản hồi nào. Nhấn &quot;Thêm phản hồi&quot; hoặc &quot;Nhập từ
            Sheet&quot; để bắt đầu.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
          Không có mục khớp bộ lọc.
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tóm tắt</TableHead>
                <TableHead>Danh mục</TableHead>
                <TableHead>Ưu tiên</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="hidden md:table-cell">Nguồn</TableHead>
                <TableHead className="hidden lg:table-cell">Ngày</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="max-w-[240px]">
                    <span className="font-medium">
                      {truncateSummary(entry.raw_summary, 72)}
                    </span>
                    {entry.reporter_name ? (
                      <span className="block text-xs text-muted-foreground truncate">
                        {entry.reporter_name}
                      </span>
                    ) : null}
                    {entry.linear_issue_id ? (
                      <Badge variant="outline" className="mt-1 text-[10px]">
                        {entry.linear_issue_id}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{labelForCategory(entry.category)}</TableCell>
                  <TableCell>{labelForPriority(entry.priority)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={entry.status === "untriaged" ? "secondary" : "outline"}
                    >
                      {labelForStatus(entry.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                    {labelForSource(entry.source)}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDate(entry.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Sửa phản hồi"
                        onClick={() => openEdit(entry)}
                        disabled={isPending}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Xóa phản hồi"
                        onClick={() => handleDelete(entry)}
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

      <p className="text-xs text-muted-foreground">
        Bảng chỉ hiển thị tóm tắt ngắn. Trích dẫn nguyên văn và ghi chú nội bộ chỉ trong
        form chỉnh sửa.
      </p>

      <FeedbackForm
        open={formOpen}
        onOpenChange={setFormOpen}
        workspaceId={workspaceId}
        mode={formMode}
        entry={editingEntry}
        betaTesters={betaTesters}
      />

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nhập từ Sheet</DialogTitle>
            <DialogDescription>
              Dán từ Google Sheet: mỗi dòng một mục, hoặc tách đoạn bằng dòng trống. Tuỳ
              chọn: tóm tắt|danh mục|ưu tiên (bug, ux, fr, ai, price, positive).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={8}
            placeholder={"Lỗi remix trên mobile\nMuốn auto đăng TikTok|fr|p2"}
            disabled={isPending}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportOpen(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button type="button" onClick={handleImport} disabled={isPending}>
              {isPending ? "Đang nhập…" : "Nhập"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
