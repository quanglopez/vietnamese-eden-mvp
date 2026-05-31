"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Mic } from "lucide-react";

import {
  AiLoadingOverlay,
  useAiLoadingTimer,
} from "@/components/custom/app/ai-loading-state";
import { VoiceErrorMessage } from "@/components/custom/voice/voice-error-message";
import { VoiceSampleExamples } from "@/components/custom/voice/voice-sample-examples";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVoiceProfileAction } from "@/lib/voice/actions";
import { MIN_VOICE_SAMPLE_CHARS } from "@/lib/voice/constants";

const DRAFT_STORAGE_KEY = "voice-profile-draft";
const CHAR_GOAL = 1000;

type VoiceProfileDraft = {
  name: string;
  description: string;
  sampleWritings: string;
  setAsDefault: boolean;
};

function getCharCounterState(charCount: number): {
  labelClass: string;
  barClass: string;
  progress: number;
} {
  if (charCount < MIN_VOICE_SAMPLE_CHARS) {
    return {
      labelClass: "text-destructive",
      barClass: "bg-destructive",
      progress: Math.round((charCount / MIN_VOICE_SAMPLE_CHARS) * 49),
    };
  }
  if (charCount < CHAR_GOAL) {
    return {
      labelClass: "text-amber-500",
      barClass: "bg-amber-500",
      progress:
        50 +
        Math.round(
          ((charCount - MIN_VOICE_SAMPLE_CHARS) / (CHAR_GOAL - MIN_VOICE_SAMPLE_CHARS)) * 49,
        ),
    };
  }
  return {
    labelClass: "text-brand",
    barClass: "bg-brand",
    progress: 100,
  };
}

type VoiceProfileFormProps = {
  onSuccess?: () => void;
};

export function VoiceProfileForm({ onSuccess }: VoiceProfileFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sampleWritings, setSampleWritings] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draftPrompt, setDraftPrompt] = useState<VoiceProfileDraft | null>(null);
  const [isPending, startTransition] = useTransition();
  const loading = useAiLoadingTimer(isPending, "voice");
  const formRef = useRef<HTMLFormElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const charCount = sampleWritings.trim().length;
  const counter = getCharCounterState(charCount);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // ignore storage errors
    }
  }, []);

  const saveDraft = useCallback(
    (draft: VoiceProfileDraft) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        try {
          if (!draft.name && !draft.description && !draft.sampleWritings) {
            clearDraft();
            return;
          }
          localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        } catch {
          // ignore storage errors
        }
      }, 1000);
    },
    [clearDraft],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as VoiceProfileDraft;
      if (parsed.name || parsed.description || parsed.sampleWritings) {
        setDraftPrompt(parsed);
      }
    } catch {
      clearDraft();
    }
  }, [clearDraft]);

  useEffect(() => {
    if (draftPrompt) {
      return;
    }
    saveDraft({ name, description, sampleWritings, setAsDefault });
  }, [name, description, sampleWritings, setAsDefault, saveDraft, draftPrompt]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const submitProfile = () => {
    setError(null);
    startTransition(async () => {
      const result = await createVoiceProfileAction({
        name,
        sampleWritings,
        description: description || undefined,
        setAsDefault,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setName("");
      setDescription("");
      setSampleWritings("");
      clearDraft();
      onSuccess?.();
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submitProfile();
  };

  const handleRestoreDraft = () => {
    if (!draftPrompt) {
      return;
    }
    setName(draftPrompt.name);
    setDescription(draftPrompt.description);
    setSampleWritings(draftPrompt.sampleWritings);
    setSetAsDefault(draftPrompt.setAsDefault);
    setDraftPrompt(null);
  };

  const handleDismissDraft = () => {
    clearDraft();
    setDraftPrompt(null);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-border/60 bg-gradient-brand-soft p-6 space-y-4"
    >
      {draftPrompt ? (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 space-y-2">
          <p className="text-sm text-foreground">
            Phát hiện bản nháp chưa hoàn thành. Khôi phục?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={handleRestoreDraft}>
              Có, khôi phục
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={handleDismissDraft}>
              Không
            </Button>
          </div>
        </div>
      ) : null}

      <div
        className={
          isPending ? "space-y-4 opacity-50 pointer-events-none select-none" : "space-y-4"
        }
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-bold">Tạo Voice Profile mới</h2>
            <p className="text-xs text-muted-foreground">
              Voice Profile giúp Remix viết đúng giọng bạn — không phải giọng AI chung chung.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice-name">Tên profile</Label>
          <Input
            id="voice-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="VD: Giọng TikTok cá nhân"
            disabled={isPending}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="voice-description">Mô tả (tuỳ chọn)</Label>
          <Input
            id="voice-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="VD: Chủ yếu review sản phẩm, giọng thân thiện"
            disabled={isPending}
          />
        </div>

        <div className="space-y-3">
          <div className="rounded-lg bg-muted/40 px-3 py-2.5 text-xs text-muted-foreground space-y-1">
            <p>
              Dán <strong className="text-foreground">2–3 bài viết hoặc caption cũ</strong> của bạn
              (mỗi bài cách nhau 2 dòng trống).
            </p>
            <p>
              AI sẽ phân tích từ vựng, cách viết câu, hook, CTA style và quy tắc ngầm.
            </p>
            <p>
              Tối thiểu {MIN_VOICE_SAMPLE_CHARS} ký tự. Nhiều hơn = giọng chính xác hơn.
            </p>
          </div>

          <VoiceSampleExamples
            disabled={isPending}
            onUseSample={(text) => setSampleWritings(text)}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="voice-samples">Bài viết mẫu</Label>
              <span className={`text-xs font-medium ${counter.labelClass}`}>
                {charCount} / {MIN_VOICE_SAMPLE_CHARS}+ ký tự
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${counter.barClass}`}
                style={{ width: `${counter.progress}%` }}
              />
            </div>
            <Textarea
              id="voice-samples"
              value={sampleWritings}
              onChange={(event) => setSampleWritings(event.target.value)}
              placeholder="Dán caption Facebook, bài TikTok, hoặc post LinkedIn của bạn…"
              disabled={isPending}
              className="min-h-[220px] resize-y font-mono text-sm"
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={setAsDefault}
            onChange={(event) => setSetAsDefault(event.target.checked)}
            disabled={isPending}
            className="rounded border-input accent-brand"
          />
          Đặt làm voice profile mặc định
        </label>

        {error ? (
          <VoiceErrorMessage
            message={error}
            onRetry={submitProfile}
            isRetrying={isPending}
          />
        ) : null}

        <Button
          type="submit"
          disabled={isPending || charCount < MIN_VOICE_SAMPLE_CHARS}
          className="w-full gap-2 bg-foreground text-background"
        >
          {isPending ? (
            <>Đang phân tích giọng viết…</>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              Huấn luyện AI với giọng của tôi
            </>
          )}
        </Button>
      </div>

      <AiLoadingOverlay
        isLoading={isPending}
        title="Đang phân tích giọng văn"
        subtitle="Có thể mất 60–120 giây với nhiều bài viết mẫu"
        stepText={loading.stepText}
        message={loading.message}
        progress={loading.progress}
      />
    </form>
  );
}
