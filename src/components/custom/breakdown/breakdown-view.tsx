"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Link2, Loader2, Sparkles, Wand2 } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { FetchErrorBanner } from "@/components/custom/app/fetch-error-banner";
import { ContentMediaCover } from "@/components/custom/content/content-media-cover";
import { AddToCalendarDialog } from "@/components/custom/calendar/add-to-calendar-dialog";
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
import type { SourceQuality } from "@/lib/content/social-importer/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatOutputCreatedAt } from "@/lib/remix/output-display";
import { getPlatformLabel } from "@/lib/content/platform-styles";
import { runContentAnalysisAction } from "@/lib/content/analysis-actions";
import { updateContentTranscriptAction } from "@/lib/content/transcript-paste-action";
import type { ContentAnalysisView, ContentItemDetail } from "@/types/analysis";
import type { CalendarItemView } from "@/types/calendar";
import type { GeneratedOutputView } from "@/types/remix";

type BreakdownViewProps = {
  item: ContentItemDetail;
  analysis: ContentAnalysisView | null;
  outputs: GeneratedOutputView[];
  calendarItems: CalendarItemView[];
  canAnalyze: boolean;
  thumbnailUrl?: string | null;
  fetchError: string | null;
  sourceQuality: SourceQuality;
};

function formatCalendarDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BreakdownView({
  item,
  analysis: initialAnalysis,
  outputs,
  calendarItems,
  canAnalyze,
  thumbnailUrl,
  fetchError,
  sourceQuality,
}: BreakdownViewProps) {
  const router = useRouter();
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [formError, setFormError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [transcriptText, setTranscriptText] = useState("");
  const [transcriptSaving, setTranscriptSaving] = useState(false);
  const [transcriptSaved, setTranscriptSaved] = useState(false);
  const loading = useAiLoadingTimer(isPending, "breakdown");

  useEffect(() => {
    setAnalysis(initialAnalysis);
  }, [initialAnalysis]);

  const backHref = item.boardId ? `/boards/${item.boardId}` : "/boards";
  const remixHref = `/remix/${item.id}`;
  const latestOutput = outputs[0] ?? null;
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

  const handleTranscriptSave = async () => {
    if (!transcriptText.trim()) return;
    setTranscriptSaving(true);
    try {
      const result = await updateContentTranscriptAction(item.id, transcriptText);
      if (!result.success) {
        setFormError(result.error);
        return;
      }
      setTranscriptSaved(true);
      setTranscriptText("");
      // Trigger re-analysis after saving transcript
      startTransition(async () => {
        const analysisResult = await runContentAnalysisAction(item.id);
        if (!analysisResult.success) {
          setFormError(analysisResult.error);
          return;
        }
        router.refresh();
      });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Lỗi khi lưu transcript.");
    } finally {
      setTranscriptSaving(false);
    }
  };

  return (
    <AppShell
      title="Content Detail"
      subtitle={`${item.title} · ${getPlatformLabel(item.platform)}`}
    >
      <AddToCalendarDialog
        output={latestOutput}
        contentItemId={item.id}
        open={calendarOpen}
        onOpenChange={setCalendarOpen}
        onSuccess={() => router.refresh()}
      />

      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại bảng
      </Link>

      {fetchError ? (
        <FetchErrorBanner message={`Không tải được dữ liệu: ${fetchError}`} />
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
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
          <div className="rounded-2xl border border-border/60 bg-surface-elev p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleAnalyze}
                disabled={isPending}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Phân tích AI
              </Button>
              <Button asChild variant="outline" className="gap-2">
                <Link href={remixHref}>
                  <Wand2 className="h-4 w-4" />
                  Tạo remix
                </Link>
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setCalendarOpen(true)}
              >
                <CalendarPlus className="h-4 w-4" />
                Add to Calendar
              </Button>
            </div>

          </div>

          <SourceQualityBadge
            quality={sourceQuality}
            showDescription={false}
            boardId={item.boardId}
          />

          {item.tags.length > 0 ? (
            <div className="rounded-xl border border-border/60 bg-surface-elev p-3">
              <p className="text-xs text-muted-foreground mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {item.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-[11px]"
                    style={{
                      backgroundColor: tag.color ?? undefined,
                      borderColor: tag.color ?? undefined,
                      color: tag.color ? "#111827" : undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}

          {showBlockedCallout ? (
            <SourceQualityBadge
              quality={sourceQuality}
              showDescription
              boardId={item.boardId}
            />
          ) : null}

          {showMetadataCalloutWhenBlocked ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm space-y-3">
              <p className="font-semibold text-foreground">
                Chỉ có metadata — cần transcript để phân tích sâu
              </p>
              <p className="text-muted-foreground">
                Không lấy được caption/transcript tự động từ link. Dán transcript hoặc script thủ công bên dưới để AI phân tích đầy đủ.
              </p>
              {transcriptSaved ? (
                <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-700 dark:text-green-300">
                  ✅ Transcript đã lưu — đang phân tích lại...
                </div>
              ) : (
                <>
                  <textarea
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[120px] resize-y placeholder:text-muted-foreground"
                    placeholder="Dán transcript hoặc script tại đây...&#10;&#10;VD: Transcript từ YouTube, caption TikTok, hoặc script của video..."
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    disabled={transcriptSaving}
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleTranscriptSave}
                      disabled={!transcriptText.trim() || transcriptSaving}
                      className="gap-2"
                    >
                      {transcriptSaving ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Phân tích lại với transcript này</>
                      )}
                    </Button>
                    {item.boardId ? (
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/boards/${item.boardId}`}>Quay lại bảng</Link>
                      </Button>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Sau khi lưu transcript, AI sẽ tự động phân tích lại nội dung với dữ liệu đầy đủ.
                  </p>
                </>
              )}
            </div>
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

                  {analysis && !isPending ? <BreakdownSections analysis={analysis} /> : null}

                  {!analysis && !isPending && !formError ? (
                    <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Bấm &quot;Phân tích AI&quot; để tạo breakdown cho nội dung này.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Chưa có nội dung để phân tích?{" "}
                        <Link href="/boards" className="text-brand hover:underline font-medium">
                          Thêm content hoặc dùng nội dung mẫu →
                        </Link>
                      </p>
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

          <div className="rounded-2xl border border-border/60 bg-surface-elev p-4">
            <h3 className="font-semibold">Remix outputs</h3>
            {outputs.length > 0 ? (
              <div className="mt-3 space-y-2">
                {outputs.map((output) => (
                  <div
                    key={output.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/50 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{output.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {output.formatLabel} · {output.toneLabel} ·{" "}
                        {formatOutputCreatedAt(output.createdAt)}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/remix/${item.id}`}>Mở remix</Link>
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Chưa có remix. Tạo remix từ AI Breakdown.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-border/60 bg-surface-elev p-4">
            <h3 className="font-semibold">Calendar usage</h3>
            {calendarItems.length > 0 ? (
              <div className="mt-3 space-y-2">
                {calendarItems.map((calendarItem) => (
                  <div
                    key={calendarItem.id}
                    className="rounded-lg border border-border/50 px-3 py-2"
                  >
                    <p className="text-sm font-medium">{calendarItem.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCalendarDateTime(calendarItem.scheduledAt)} ·{" "}
                      {calendarItem.channelLabel} · {calendarItem.status}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                Chưa lên lịch. Thêm vào Content Calendar.
              </p>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
