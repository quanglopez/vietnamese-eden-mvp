"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Link2, Wand2 } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { ContentMediaCover } from "@/components/custom/content/content-media-cover";
import {
  AiErrorBanner,
  AiLoadingOverlay,
  useAiLoadingTimer,
} from "@/components/custom/app/ai-loading-state";
import {
  BreakdownSections,
  BreakdownStatusBanner,
} from "@/components/custom/breakdown/breakdown-sections";
import { SourceQualityBadge } from "@/components/custom/breakdown/source-quality-badge";
import { getSourceQualityFromItem } from "@/lib/content/analysis-source-quality";
import { Button } from "@/components/ui/button";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import { runContentAnalysisAction } from "@/lib/content/analysis-actions";
import type { ContentAnalysisView, ContentItemDetail } from "@/types/analysis";

type BreakdownViewProps = {
  item: ContentItemDetail;
  analysis: ContentAnalysisView | null;
  canAnalyze: boolean;
  thumbnailUrl?: string | null;
  fetchError: string | null;
};

export function BreakdownView({
  item,
  analysis: initialAnalysis,
  canAnalyze,
  thumbnailUrl,
  fetchError,
}: BreakdownViewProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const loading = useAiLoadingTimer(isPending, "breakdown");

  useEffect(() => {
    setAnalysis(initialAnalysis);
  }, [initialAnalysis]);

  const backHref = item.boardId ? `/boards/${item.boardId}` : "/boards";
  const remixHref = `/remix/${item.id}`;
  const canOpenRemix = canAnalyze || Boolean(analysis);
  const sourceQuality = getSourceQualityFromItem(item);
  const isBlockedQuality =
    sourceQuality === "blocked" || sourceQuality === "manual_required";
  const showBlockedCallout = !canAnalyze && isBlockedQuality;
  const showAmberFallback = !canAnalyze && !isBlockedQuality;
  const showMetadataCalloutWhenBlocked =
    !canAnalyze && sourceQuality === "metadata_only";

  const handleAnalyze = () => {
    setFormError(null);
    startTransition(async () => {
      const result = await runContentAnalysisAction(item.id);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <AppShell
      title="AI Breakdown"
      subtitle={`${item.title} · ${getPlatformLabel(item.platform)}`}
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại bảng
      </Link>

      {fetchError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {fetchError}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[360px_1fr] gap-8">
        <aside>
          <div className="relative rounded-2xl overflow-hidden border border-border/60 aspect-[3/4] sticky top-24">
            <ContentMediaCover
              platform={item.platform}
              title={item.title}
              rawContent={item.rawContent}
              thumbnailUrl={thumbnailUrl}
              className="h-full"
            />
            {item.sourceUrl ? (
              <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-1 bg-black/55 px-4 py-2 text-white/90 text-xs">
                <Link2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{item.sourceUrl}</span>
              </div>
            ) : null}
          </div>
        </aside>

        <div className="space-y-4">
          {showBlockedCallout ? (
            <SourceQualityBadge
              quality={sourceQuality}
              showDescription
              boardId={item.boardId}
            />
          ) : null}

          {showMetadataCalloutWhenBlocked ? (
            <SourceQualityBadge
              quality={sourceQuality}
              showDescription
              boardId={item.boardId}
            />
          ) : null}

          {showAmberFallback ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm">
              <p className="font-semibold text-foreground">Chưa thể phân tích bằng AI</p>
              <p className="mt-2 text-muted-foreground">
                Không lấy được metadata từ link (YouTube/TikTok có thể chặn tự động).
                Hãy dùng tab <strong>Paste text</strong> trên bảng và dán caption/script để phân
                tích sâu hơn.
              </p>
              {item.boardId ? (
                <Button asChild variant="outline" size="sm" className="mt-4">
                  <Link href={`/boards/${item.boardId}`}>Quay lại bảng để thêm text</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          {canAnalyze ? (
            <>
              <div className="relative space-y-4">
                <div
                  className={
                    isPending ? "space-y-4 opacity-50 pointer-events-none select-none" : "space-y-4"
                  }
                >
                  <BreakdownStatusBanner
                    hasAnalysis={Boolean(analysis)}
                    aiModel={analysis?.aiModel ?? null}
                    onReanalyze={handleAnalyze}
                    isAnalyzing={isPending}
                  />

                  <SourceQualityBadge
                    quality={sourceQuality}
                    showDescription={sourceQuality === "metadata_only"}
                    boardId={item.boardId}
                  />

                  {analysis && !isPending ? <BreakdownSections analysis={analysis} /> : null}

                  {canOpenRemix ? (
                    <div className="pt-2">
                      <Button asChild variant="outline" className="gap-2 w-full sm:w-auto">
                        <Link href={remixHref}>
                          <Wand2 className="h-4 w-4" />
                          Tạo remix
                        </Link>
                      </Button>
                      {!analysis ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Cần phân tích AI trước khi generate remix.
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {!analysis && !isPending && !formError ? (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center text-muted-foreground">
                      Bấm &quot;Phân tích AI&quot; để tạo breakdown cho nội dung này.
                    </div>
                  ) : null}
                </div>

                <AiLoadingOverlay
                  isLoading={isPending}
                  title="AI Breakdown"
                  subtitle="Có thể mất 30–90 giây · Có thể lâu hơn với nội dung dài"
                  stepText={loading.stepText}
                  message={loading.message}
                  progress={loading.progress}
                />
              </div>

              {formError ? <AiErrorBanner message={formError} /> : null}
            </>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
