"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { ArrowLeft, Wand2 } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { RemixActionToast, type RemixToast } from "@/components/custom/remix/remix-action-toast";
import { RemixForm } from "@/components/custom/remix/remix-form";
import { RemixOutputList } from "@/components/custom/remix/remix-output-list";
import { RemixOutputToolbar } from "@/components/custom/remix/remix-output-toolbar";
import { Button } from "@/components/ui/button";
import type { GeneratedOutputView, RemixPageContext } from "@/types/remix";

type RemixViewProps = {
  context: RemixPageContext;
  outputs: GeneratedOutputView[];
  fetchError: string | null;
};

export function RemixView({ context, outputs, fetchError }: RemixViewProps) {
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<RemixToast | null>(null);

  const backHref = context.boardId ? `/boards/${context.boardId}` : "/boards";
  const breakdownHref = `/breakdown/${context.itemId}`;

  const formDisabled = !context.canGenerate;
  const disabledMessage = context.blockReason;

  const showToast = useCallback((next: RemixToast) => {
    setToast(next);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <AppShell title="Remix Generator" subtitle={context.itemTitle}>
      <RemixActionToast toast={toast} onDismiss={() => setToast(null)} />

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Quay lại bảng
        </Link>
        <span className="text-muted-foreground">·</span>
        <Link
          href={breakdownHref}
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline"
        >
          <Wand2 className="h-4 w-4" /> AI Breakdown
        </Link>
      </div>

      {fetchError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Không tải được outputs: {fetchError}
        </div>
      ) : null}

      {!context.hasRawContent && !context.hasAnalysis ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm mb-6">
          <p className="font-semibold">Chưa thể tạo remix</p>
          <p className="mt-2 text-muted-foreground">{context.blockReason}</p>
          {context.boardId ? (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/boards/${context.boardId}`}>Quay lại bảng</Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[380px_1fr] gap-8">
          <div ref={formRef} className="space-y-4 scroll-mt-24">
            <RemixForm
              contentItemId={context.itemId}
              disabled={formDisabled}
              disabledMessage={disabledMessage}
              onSuccess={() => {
                showToast({ type: "success", message: "Đã tạo remix mới." });
                router.refresh();
              }}
            />
            {!context.hasAnalysis ? (
              <Button asChild className="w-full" variant="outline">
                <Link href={breakdownHref}>Đi phân tích AI</Link>
              </Button>
            ) : null}
          </div>

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-display font-bold text-lg">
                Biến thể đã tạo ({outputs.length})
              </h2>
            </div>

            <RemixOutputToolbar
              outputs={outputs}
              sourceTitle={context.itemTitle}
              onToast={showToast}
            />

            <RemixOutputList
              outputs={outputs}
              sourceTitle={context.itemTitle}
              sourceItemId={context.itemId}
              canCreateRemix={context.canGenerate}
              onToast={showToast}
              onCreateFirstRemix={scrollToForm}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}
