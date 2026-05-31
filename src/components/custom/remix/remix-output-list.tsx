"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GeneratedOutputView } from "@/types/remix";

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type RemixOutputListProps = {
  outputs: GeneratedOutputView[];
};

export function RemixOutputList({ outputs }: RemixOutputListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (output: GeneratedOutputView) => {
    try {
      await navigator.clipboard.writeText(output.content);
      setCopiedId(output.id);
      window.setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  if (outputs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground text-sm">
        Chưa có remix nào. Chọn format và tone rồi bấm tạo biến thể.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {outputs.map((output) => (
        <article
          key={output.id}
          className="rounded-2xl border border-border/60 bg-surface-elev p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h3 className="font-display font-bold text-base">{output.title}</h3>
              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                <span className="bg-brand/10 text-brand px-2 py-0.5 rounded-full font-medium">
                  {output.formatLabel}
                </span>
                <span className="bg-muted px-2 py-0.5 rounded-full">{output.toneLabel}</span>
                <span>{formatCreatedAt(output.createdAt)}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => handleCopy(output)}
            >
              {copiedId === output.id ? (
                <>
                  <Check className="h-3.5 w-3.5 text-brand" />
                  Đã copy
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
            {output.content}
          </p>
        </article>
      ))}
    </div>
  );
}
