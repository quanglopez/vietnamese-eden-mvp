"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { suggestCategory } from "@/lib/feedback/auto-classify";
import {
  createFeedbackEntryAction,
  updateFeedbackEntryAction,
  type CreateFeedbackInput,
  type UpdateFeedbackInput,
} from "@/lib/feedback/actions";
import {
  FEEDBACK_CATEGORY_OPTIONS,
  FEEDBACK_DEVICE_OPTIONS,
  FEEDBACK_PERSONA_OPTIONS,
  FEEDBACK_PRIORITY_OPTIONS,
  FEEDBACK_REPRODUCIBLE_OPTIONS,
  FEEDBACK_SOURCE_OPTIONS,
  FEEDBACK_STATUS_OPTIONS,
  labelForCategory,
  type FeedbackCategory,
  type FeedbackEntryRow,
  type FeedbackReporterPersona,
} from "@/types/feedback";
import type { BetaTesterRow } from "@/types/beta-testers";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type FeedbackFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  mode: "create" | "edit";
  entry?: FeedbackEntryRow;
  betaTesters: Pick<BetaTesterRow, "id" | "email" | "full_name">[];
};

export function FeedbackForm({
  open,
  onOpenChange,
  workspaceId,
  mode,
  entry,
  betaTesters,
}: FeedbackFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [source, setSource] = useState<CreateFeedbackInput["source"]>("manual_chat");
  const [sourceRef, setSourceRef] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPersona, setReporterPersona] = useState<string>("");
  const [cohort, setCohort] = useState("cohort-2");
  const [rawSummary, setRawSummary] = useState("");
  const [verbatimQuotes, setVerbatimQuotes] = useState("");
  const [category, setCategory] = useState<FeedbackCategory>("bug");
  const [priority, setPriority] = useState<string>("");
  const [status, setStatus] = useState<CreateFeedbackInput["status"]>("untriaged");
  const [betaTesterId, setBetaTesterId] = useState("");
  const [linearIssueId, setLinearIssueId] = useState("");
  const [actionNotes, setActionNotes] = useState("");
  const [repliedToUser, setRepliedToUser] = useState(false);
  const [device, setDevice] = useState<string>("");
  const [reproducible, setReproducible] = useState<string>("");
  const [notes, setNotes] = useState("");

  const suggestedCategory = useMemo(
    () => (rawSummary.trim().length >= 3 ? suggestCategory(rawSummary) : null),
    [rawSummary],
  );

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (mode === "edit" && entry) {
      setSource(entry.source);
      setSourceRef(entry.source_ref ?? "");
      setReporterName(entry.reporter_name ?? "");
      setReporterPersona(entry.reporter_persona ?? "");
      setCohort(entry.cohort);
      setRawSummary(entry.raw_summary);
      setVerbatimQuotes((entry.verbatim_quotes ?? []).join("\n"));
      setCategory(entry.category);
      setPriority(entry.priority ?? "");
      setStatus(entry.status);
      setBetaTesterId(entry.beta_tester_id ?? "");
      setLinearIssueId(entry.linear_issue_id ?? "");
      setActionNotes(entry.action_notes ?? "");
      setRepliedToUser(entry.replied_to_user);
      setDevice(entry.device ?? "");
      setReproducible(entry.reproducible ?? "");
      setNotes(entry.notes ?? "");
    } else {
      setSource("manual_chat");
      setSourceRef("");
      setReporterName("");
      setReporterPersona("");
      setCohort("cohort-2");
      setRawSummary("");
      setVerbatimQuotes("");
      setCategory("bug");
      setPriority("");
      setStatus("untriaged");
      setBetaTesterId("");
      setLinearIssueId("");
      setActionNotes("");
      setRepliedToUser(false);
      setDevice("");
      setReproducible("");
      setNotes("");
    }
  }, [open, mode, entry]);

  function applySuggestion() {
    if (suggestedCategory) {
      setCategory(suggestedCategory);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const persona: FeedbackReporterPersona | null =
        reporterPersona.length > 0
          ? (reporterPersona as FeedbackReporterPersona)
          : null;

      if (mode === "create") {
        const result = await createFeedbackEntryAction({
          workspaceId,
          source,
          sourceRef,
          reporterName,
          reporterPersona: persona,
          cohort,
          rawSummary,
          verbatimQuotes,
          category,
          priority: priority ? (priority as CreateFeedbackInput["priority"]) : null,
          status,
          betaTesterId: betaTesterId || null,
          linearIssueId,
          actionNotes,
          repliedToUser,
          device: device ? (device as CreateFeedbackInput["device"]) : null,
          reproducible: reproducible
            ? (reproducible as CreateFeedbackInput["reproducible"])
            : null,
          notes,
        });
        if (!result.success) {
          setError(result.error);
          return;
        }
        onOpenChange(false);
        return;
      }

      if (!entry) return;

      const patch: UpdateFeedbackInput = {
        entryId: entry.id,
        workspaceId,
        source,
        sourceRef: sourceRef || null,
        reporterName: reporterName || null,
        reporterPersona: persona,
        cohort,
        rawSummary,
        verbatimQuotes,
        category,
        priority: priority ? (priority as UpdateFeedbackInput["priority"]) : null,
        status,
        betaTesterId: betaTesterId || null,
        linearIssueId: linearIssueId || null,
        actionNotes: actionNotes || null,
        repliedToUser,
        device: device ? (device as UpdateFeedbackInput["device"]) : null,
        reproducible: reproducible
          ? (reproducible as UpdateFeedbackInput["reproducible"])
          : null,
        notes: notes || null,
      };

      const result = await updateFeedbackEntryAction(patch);
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Thêm phản hồi" : "Sửa phản hồi"}
          </DialogTitle>
          <DialogDescription>
            NORM entry — tóm tắt và trích dẫn chỉ hiển thị cho admin. Không gửi email tự
            động.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-source">Nguồn</Label>
              <select
                id="fb-source"
                value={source}
                onChange={(e) =>
                  setSource(e.target.value as CreateFeedbackInput["source"])
                }
                disabled={isPending}
                className={selectClassName}
              >
                {FEEDBACK_SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-source-ref">Mã nguồn (tuỳ chọn)</Label>
              <Input
                id="fb-source-ref"
                value={sourceRef}
                onChange={(e) => setSourceRef(e.target.value)}
                disabled={isPending}
                placeholder="Form response ID, link chat…"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-reporter">Người báo (ẩn danh)</Label>
              <Input
                id="fb-reporter"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-persona">Persona</Label>
              <select
                id="fb-persona"
                value={reporterPersona}
                onChange={(e) => setReporterPersona(e.target.value)}
                disabled={isPending}
                className={selectClassName}
              >
                <option value="">—</option>
                {FEEDBACK_PERSONA_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-summary">Tóm tắt (raw_summary)</Label>
            <Textarea
              id="fb-summary"
              required
              value={rawSummary}
              onChange={(e) => setRawSummary(e.target.value)}
              disabled={isPending}
              rows={3}
              placeholder="Tóm tắt phản hồi do admin viết…"
            />
            {suggestedCategory && suggestedCategory !== category ? (
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  Gợi ý danh mục: {labelForCategory(suggestedCategory)}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={applySuggestion}
                  disabled={isPending}
                >
                  Áp dụng gợi ý
                </Button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-quotes">Trích dẫn nguyên văn (mỗi dòng một quote)</Label>
            <Textarea
              id="fb-quotes"
              value={verbatimQuotes}
              onChange={(e) => setVerbatimQuotes(e.target.value)}
              disabled={isPending}
              rows={3}
              placeholder="&gt; Câu nguyên văn của user…"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-category">Danh mục</Label>
              <select
                id="fb-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                disabled={isPending}
                className={selectClassName}
              >
                {FEEDBACK_CATEGORY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-priority">Ưu tiên</Label>
              <select
                id="fb-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isPending}
                className={selectClassName}
              >
                <option value="">—</option>
                {FEEDBACK_PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-status">Trạng thái</Label>
              <select
                id="fb-status"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as CreateFeedbackInput["status"])
                }
                disabled={isPending}
                className={selectClassName}
              >
                {FEEDBACK_STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-tester">Beta tester (tuỳ chọn)</Label>
              <select
                id="fb-tester"
                value={betaTesterId}
                onChange={(e) => setBetaTesterId(e.target.value)}
                disabled={isPending}
                className={selectClassName}
              >
                <option value="">—</option>
                {betaTesters.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.full_name ? `${t.full_name} · ` : ""}
                    {t.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-linear">Linear (ALE-XXX)</Label>
              <Input
                id="fb-linear"
                value={linearIssueId}
                onChange={(e) => setLinearIssueId(e.target.value)}
                disabled={isPending}
                placeholder="ALE-173"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fb-device">Thiết bị</Label>
              <select
                id="fb-device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                disabled={isPending}
                className={selectClassName}
              >
                <option value="">—</option>
                {FEEDBACK_DEVICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fb-repro">Tái hiện được?</Label>
              <select
                id="fb-repro"
                value={reproducible}
                onChange={(e) => setReproducible(e.target.value)}
                disabled={isPending}
                className={selectClassName}
              >
                <option value="">—</option>
                {FEEDBACK_REPRODUCIBLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-action">Hành động đã làm</Label>
            <Textarea
              id="fb-action"
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              disabled={isPending}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fb-notes">Ghi chú nội bộ</Label>
            <Textarea
              id="fb-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              Ghi chú nội bộ: chỉ hiển thị khi chỉnh sửa.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={repliedToUser}
              onChange={(e) => setRepliedToUser(e.target.checked)}
              disabled={isPending}
              className="rounded border-input"
            />
            Đã phản hồi user
          </label>

          <div className="space-y-2">
            <Label htmlFor="fb-cohort">Cohort</Label>
            <Input
              id="fb-cohort"
              value={cohort}
              onChange={(e) => setCohort(e.target.value)}
              disabled={isPending}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Đang lưu…" : mode === "create" ? "Thêm phản hồi" : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
