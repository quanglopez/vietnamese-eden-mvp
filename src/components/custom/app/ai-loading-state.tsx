"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AI_RETRY_ADVICE,
  getEstimatedProgress,
  getLoadingMessage,
  getLoadingStepText,
  type AiLoadingTask,
} from "@/lib/content/loading-messages";

export function useAiLoadingTimer(isLoading: boolean, task: AiLoadingTask) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isLoading]);

  return {
    elapsedSeconds,
    message: getLoadingMessage(task, elapsedSeconds),
    stepText: getLoadingStepText(task, elapsedSeconds),
    progress: getEstimatedProgress(task, elapsedSeconds),
  };
}

type AiLoadingOverlayProps = {
  isLoading: boolean;
  title: string;
  subtitle: string;
  stepText?: string;
  progress?: number;
  message?: string;
  onCancel?: () => void;
};

export function AiLoadingOverlay({
  isLoading,
  title,
  subtitle,
  stepText,
  progress,
  message,
  onCancel,
}: AiLoadingOverlayProps) {
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/75 backdrop-blur-[2px] p-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Card className="w-full max-w-md border-border/80 shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-brand shrink-0" />
            {title}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {stepText ? (
            <p className="text-xs font-medium text-brand">{stepText}</p>
          ) : null}
          {message ? <p className="text-sm text-foreground">{message}</p> : null}
          {progress !== undefined ? (
            <div className="space-y-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-brand transition-all duration-1000 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-right">
                Đang xử lý… {progress}%
              </p>
            </div>
          ) : null}
          <p className="text-xs text-muted-foreground border-t border-border/60 pt-3">
            Vui lòng không đóng hoặc tải lại trang trong lúc AI đang chạy.
          </p>
          {onCancel ? (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Huỷ
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

type AiErrorBannerProps = {
  message: string;
};

export function AiErrorBanner({ message }: AiErrorBannerProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <p>{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">{AI_RETRY_ADVICE}</p>
    </div>
  );
}
