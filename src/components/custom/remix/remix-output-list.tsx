"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarPlus, Copy, Download, FileText, Sparkles } from "lucide-react";

import { AddToCalendarDialog } from "@/components/custom/calendar/add-to-calendar-dialog";
import { Button } from "@/components/ui/button";
import {
  formatOutputCreatedAt,
  getOutputDisplayTitle,
  getOutputStatusLabel,
} from "@/lib/remix/output-display";
import {
  buildSingleOutputMarkdown,
  buildSingleOutputPlainText,
  copyTextToClipboard,
  downloadTextFile,
  getSingleOutputMdFilename,
  getSingleOutputTxtFilename,
} from "@/lib/remix/output-export";
import type { GeneratedOutputView } from "@/types/remix";

type RemixOutputListProps = {
  outputs: GeneratedOutputView[];
  sourceTitle: string;
  sourceItemId: string;
  canCreateRemix: boolean;
  onToast: (toast: { type: "success" | "error"; message: string }) => void;
  onCreateFirstRemix?: () => void;
};

export function RemixOutputList({
  outputs,
  sourceTitle,
  sourceItemId,
  canCreateRemix,
  onToast,
  onCreateFirstRemix,
}: RemixOutputListProps) {
  const [calendarOutput, setCalendarOutput] = useState<GeneratedOutputView | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const handleCopy = async (output: GeneratedOutputView) => {
    try {
      await copyTextToClipboard(output.content);
      onToast({ type: "success", message: "Đã copy nội dung vào clipboard." });
    } catch (error) {
      onToast({
        type: "error",
        message: error instanceof Error ? error.message : "Copy thất bại.",
      });
    }
  };

  const handleExportTxt = (output: GeneratedOutputView) => {
    try {
      downloadTextFile(
        getSingleOutputTxtFilename(output),
        buildSingleOutputPlainText(output),
        "text/plain",
      );
      onToast({ type: "success", message: "Đã tải file .txt." });
    } catch {
      onToast({ type: "error", message: "Export .txt thất bại." });
    }
  };

  const handleExportMd = (output: GeneratedOutputView) => {
    try {
      downloadTextFile(
        getSingleOutputMdFilename(output),
        buildSingleOutputMarkdown(output),
        "text/markdown",
      );
      onToast({ type: "success", message: "Đã tải file .md." });
    } catch {
      onToast({ type: "error", message: "Export .md thất bại." });
    }
  };

  if (outputs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 p-10 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-brand-soft grid place-items-center mb-4">
          <Sparkles className="h-6 w-6 text-brand" />
        </div>
        <p className="font-display font-bold text-lg">Chưa có remix nào</p>
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
          Tạo biến thể từ nội dung &quot;{sourceTitle}&quot; — chọn format, tone và số lượng biến
          thể bên trái.
        </p>
        {canCreateRemix && onCreateFirstRemix ? (
          <Button type="button" className="mt-6 gap-2" onClick={onCreateFirstRemix}>
            <Sparkles className="h-4 w-4" />
            Tạo remix đầu tiên
          </Button>
        ) : (
          <Button asChild variant="outline" className="mt-6">
            <Link href={`/breakdown/${sourceItemId}`}>Phân tích AI trước</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
      <AddToCalendarDialog
        output={calendarOutput}
        contentItemId={sourceItemId}
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        onSuccess={() => onToast({ type: "success", message: "Đã thêm vào lịch nội dung." })}
      />

      <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Nguồn:{" "}
        <Link href={`/breakdown/${sourceItemId}`} className="text-brand hover:underline">
          {sourceTitle}
        </Link>
      </p>

      {outputs.map((output) => {
        const displayTitle = getOutputDisplayTitle(output);
        const statusLabel = getOutputStatusLabel(output.status);

        return (
          <article
            key={output.id}
            className="rounded-2xl border border-border/60 bg-surface-elev p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-base">{displayTitle}</h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                    {output.formatLabel}
                  </span>
                  <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    {output.toneLabel}
                  </span>
                  <span
                    className="bg-foreground/5 text-foreground px-2 py-0.5 rounded-full"
                    title="Trạng thái"
                  >
                    {statusLabel}
                  </span>
                  <span className="text-muted-foreground self-center">
                    {formatOutputCreatedAt(output.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleCopy(output)}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleExportTxt(output)}
                >
                  <Download className="h-3.5 w-3.5" />
                  .txt
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => handleExportMd(output)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  .md
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 border-brand/40 text-brand"
                  onClick={() => {
                    setCalendarOutput(output);
                    setCalendarOpen(true);
                  }}
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Đưa vào lịch
                </Button>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap border-t border-border/40 pt-4">
              {output.content}
            </p>
          </article>
        );
      })}
    </div>
    </>
  );
}
