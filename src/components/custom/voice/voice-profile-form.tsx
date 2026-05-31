"use client";

import { useState, useTransition } from "react";
import { Mic } from "lucide-react";

import {
  AiErrorBanner,
  AiLoadingOverlay,
  useAiLoadingTimer,
} from "@/components/custom/app/ai-loading-state";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createVoiceProfileAction } from "@/lib/voice/actions";
import { MIN_VOICE_SAMPLE_CHARS } from "@/lib/voice/constants";

type VoiceProfileFormProps = {
  onSuccess?: () => void;
};

export function VoiceProfileForm({ onSuccess }: VoiceProfileFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sampleWritings, setSampleWritings] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const loading = useAiLoadingTimer(isPending, "voice");

  const charCount = sampleWritings.trim().length;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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
      onSuccess?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative rounded-2xl border border-border/60 bg-gradient-brand-soft p-6 space-y-4"
    >
      <div className={isPending ? "space-y-4 opacity-50 pointer-events-none select-none" : "space-y-4"}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold">Tạo Voice Profile mới</h2>
          <p className="text-xs text-muted-foreground">
            Dán 10–30 bài viết cũ (tối thiểu {MIN_VOICE_SAMPLE_CHARS} ký tự)
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="voice-samples">Bài viết mẫu</Label>
          <span
            className={`text-xs ${charCount >= MIN_VOICE_SAMPLE_CHARS ? "text-brand" : "text-muted-foreground"}`}
          >
            {charCount} / {MIN_VOICE_SAMPLE_CHARS}+ ký tự
          </span>
        </div>
        <Textarea
          id="voice-samples"
          value={sampleWritings}
          onChange={(event) => setSampleWritings(event.target.value)}
          placeholder="Dán từng bài, cách nhau bằng một dòng trống…"
          disabled={isPending}
          className="min-h-[220px] resize-y font-mono text-sm"
          required
        />
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

      {error ? <AiErrorBanner message={error} /> : null}

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
            Phân tích & lưu profile
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
