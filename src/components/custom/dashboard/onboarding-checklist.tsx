"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowRight, CheckCircle2, Circle, PartyPopper, X } from "lucide-react";

import { Button } from "@/components/ui/button";

export type OnboardingChecklistStep = {
  id: string;
  label: string;
  href: string;
  done: boolean;
};

export type OnboardingChecklistProgress = {
  userId: string;
  workspaceId: string;
  steps: OnboardingChecklistStep[];
};

function getDismissStorageKey(userId: string, workspaceId: string): string {
  return `vietnamese_eden_onboarding_dismissed:${userId}:${workspaceId}`;
}

function readDismissed(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  try {
    return window.localStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeDismissed(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(key, "true");
  } catch {
    // Unavailable storage — checklist stays visible until user can dismiss again.
  }
}

type OnboardingChecklistProps = {
  progress: OnboardingChecklistProgress;
  /** Shown after user dismisses a completed checklist (replaces hero slot). */
  fallback?: ReactNode;
};

export function OnboardingChecklist({ progress, fallback = null }: OnboardingChecklistProps) {
  const storageKey = useMemo(
    () => getDismissStorageKey(progress.userId, progress.workspaceId),
    [progress.userId, progress.workspaceId],
  );

  const [dismissed, setDismissed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDismissed(readDismissed(storageKey));
    setHydrated(true);
  }, [storageKey]);

  const completedCount = progress.steps.filter((step) => step.done).length;
  const totalSteps = progress.steps.length;
  const allDone = completedCount === totalSteps && totalSteps > 0;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  const handleDismiss = () => {
    writeDismissed(storageKey);
    setDismissed(true);
  };

  if (!hydrated) {
    return null;
  }

  if (allDone && dismissed) {
    return <>{fallback}</>;
  }

  return (
    <section
      className="mb-8 rounded-2xl border border-brand/30 bg-gradient-brand-soft p-4 sm:p-6 min-w-0"
      aria-label="Tiến độ làm quen"
      data-testid="onboarding-checklist"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-bold">Tiến độ làm quen</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount}/{totalSteps} bước hoàn thành
          </p>
        </div>
        {allDone ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0 gap-1"
            onClick={handleDismiss}
            data-testid="onboarding-checklist-dismiss"
          >
            <X className="h-4 w-4" />
            Ẩn checklist
          </Button>
        ) : null}
      </div>

      <div
        className="h-2 w-full rounded-full bg-background/60 overflow-hidden mb-5"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completedCount} trên ${totalSteps} bước`}
      >
        <div
          className="h-full rounded-full bg-brand transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {allDone ? (
        <p className="text-sm font-medium text-foreground mb-4 flex items-start gap-2">
          <PartyPopper className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <span>
            Tuyệt vời! Bạn đã sẵn sàng sử dụng Vietnamese Eden 🎉
          </span>
        </p>
      ) : (
        <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
          Hoàn thành các bước dưới đây để làm quen luồng Board → Content → Phân tích AI →
          Remix → Giọng văn.
        </p>
      )}

      <ol className="space-y-2 min-w-0">
        {progress.steps.map((step, index) => (
          <li key={step.id}>
            <Link
              href={step.href}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition min-w-0 ${
                step.done
                  ? "border-border/50 bg-background/40 text-muted-foreground"
                  : "border-border/80 bg-background/70 hover:border-brand/40 hover:shadow-sm"
              }`}
            >
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-brand shrink-0" aria-hidden />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground shrink-0" aria-hidden />
              )}
              <span className="flex-1 min-w-0 text-sm sm:text-base">
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                <span className={step.done ? "line-through" : "font-medium"}>{step.label}</span>
              </span>
              {!step.done ? (
                <ArrowRight className="h-4 w-4 text-brand shrink-0" aria-hidden />
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
