"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, FileText } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  buildLinearCandidateDraft,
  type LinearCandidateDraft,
} from "@/lib/feedback/linear-candidate";
import { labelForCategory, labelForPriority, type FeedbackEntryRow } from "@/types/feedback";

type LinearCandidateModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: FeedbackEntryRow | null;
  allEntries: FeedbackEntryRow[];
};

function DraftSummary({ draft }: { draft: LinearCandidateDraft }) {
  return (
    <div className="space-y-4 text-sm">
      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tiêu đề đề xuất
        </p>
        <p className="font-medium">{draft.title}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{draft.severityLabel}</Badge>
        <Badge variant="secondary">{draft.categoryLabel}</Badge>
        <Badge variant="outline">{draft.priorityLabel}</Badge>
      </div>

      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tóm tắt phản hồi
        </p>
        <p className="whitespace-pre-wrap">{draft.rawSummary}</p>
      </section>

      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ghi chú phân tích
        </p>
        <p className="whitespace-pre-wrap text-muted-foreground">{draft.analystNotes}</p>
      </section>

      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bằng chứng / nguồn
        </p>
        <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
          {draft.evidenceLines.map((line) => (
            <li key={line}>{line.replace(/^- /, "")}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Dự án Linear đề xuất
        </p>
        <p>{draft.recommendedProject}</p>
      </section>

      <section className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Gợi ý trùng lặp
        </p>
        {draft.duplicateHints.length === 0 ? (
          <p className="text-muted-foreground">Không phát hiện mục tương tự.</p>
        ) : (
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 space-y-2">
            <p className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Cảnh báo: có thể trùng với {draft.duplicateHints.length} mục khác
            </p>
            <ul className="space-y-1 text-muted-foreground">
              {draft.duplicateHints.map((hint) => (
                <li key={hint.entryId}>
                  {hint.summary} — {labelForCategory(hint.category)},{" "}
                  {labelForPriority(hint.priority)} (overlap {hint.overlapCount})
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export function LinearCandidateModal({
  open,
  onOpenChange,
  entry,
  allEntries,
}: LinearCandidateModalProps) {
  const [copied, setCopied] = useState(false);

  const draft = useMemo(() => {
    if (!entry) return null;
    return buildLinearCandidateDraft(entry, allEntries);
  }, [entry, allEntries]);

  async function handleCopy() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.markdown);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // graceful fallback: user can select textarea manually
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Nháp Linear candidate
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-2">
              <p className="font-medium text-amber-800 dark:text-amber-300">
                Đây chỉ là bản nháp. Chưa tạo Linear issue.
              </p>
              <p>
                Chỉ sao chép markdown để dán vào Linear thủ công. Không có API call hay tạo
                issue tự động.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        {draft ? (
          <div className="space-y-6">
            <DraftSummary draft={draft} />

            <section className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Markdown để sao chép
                </p>
                <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopy}>
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Đã sao chép
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Sao chép markdown
                    </>
                  )}
                </Button>
              </div>
              <Textarea
                readOnly
                value={draft.markdown}
                rows={14}
                className="font-mono text-xs"
                aria-label="Markdown nháp Linear"
              />
            </section>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
