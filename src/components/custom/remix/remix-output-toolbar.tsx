"use client";

import { Copy, Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  buildAllOutputsMarkdown,
  buildAllOutputsPlainText,
  copyTextToClipboard,
  downloadTextFile,
  getAllOutputsMdFilename,
  getAllOutputsTxtFilename,
} from "@/lib/remix/output-export";
import type { GeneratedOutputView } from "@/types/remix";

type RemixOutputToolbarProps = {
  outputs: GeneratedOutputView[];
  sourceTitle: string;
  onToast: (toast: { type: "success" | "error"; message: string }) => void;
};

export function RemixOutputToolbar({ outputs, sourceTitle, onToast }: RemixOutputToolbarProps) {
  if (outputs.length === 0) {
    return null;
  }

  const handleCopyAll = async () => {
    try {
      await copyTextToClipboard(buildAllOutputsPlainText(outputs));
      onToast({ type: "success", message: `Đã copy ${outputs.length} biến thể vào clipboard.` });
    } catch (error) {
      onToast({
        type: "error",
        message: error instanceof Error ? error.message : "Copy thất bại.",
      });
    }
  };

  const handleExportAllTxt = () => {
    try {
      downloadTextFile(
        getAllOutputsTxtFilename(sourceTitle),
        buildAllOutputsPlainText(outputs),
        "text/plain",
      );
      onToast({ type: "success", message: "Đã tải file .txt (tất cả biến thể)." });
    } catch {
      onToast({ type: "error", message: "Export .txt thất bại." });
    }
  };

  const handleExportAllMd = () => {
    try {
      downloadTextFile(
        getAllOutputsMdFilename(sourceTitle),
        buildAllOutputsMarkdown(outputs, sourceTitle),
        "text/markdown",
      );
      onToast({ type: "success", message: "Đã tải file .md (tất cả biến thể)." });
    } catch {
      onToast({ type: "error", message: "Export .md thất bại." });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleCopyAll}>
        <Copy className="h-3.5 w-3.5" />
        Copy tất cả
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleExportAllTxt}
      >
        <Download className="h-3.5 w-3.5" />
        Export all .txt
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleExportAllMd}
      >
        <FileText className="h-3.5 w-3.5" />
        Export all .md
      </Button>
    </div>
  );
}
