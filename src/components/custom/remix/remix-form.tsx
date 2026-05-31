"use client";

import { useEffect, useState, useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { generateRemixAction } from "@/lib/content/remix-actions";
import {
  DEFAULT_REMIX_VARIANT_COUNT,
  MAX_REMIX_VARIANT_COUNT,
  REMIX_FORMAT_OPTIONS,
  REMIX_TONE_OPTIONS,
} from "@/lib/remix/constants";
import type { RemixFormat, RemixTone } from "@/types/remix";
import type { VoiceProfileListItem } from "@/types/voice";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

type RemixFormProps = {
  contentItemId: string;
  voiceProfiles: VoiceProfileListItem[];
  disabled?: boolean;
  disabledMessage?: string | null;
  onSuccess?: () => void;
};

export function RemixForm({
  contentItemId,
  voiceProfiles,
  disabled = false,
  disabledMessage,
  onSuccess,
}: RemixFormProps) {
  const defaultVoiceId =
    voiceProfiles.find((p) => p.isDefault)?.id ?? voiceProfiles[0]?.id ?? "";
  const [format, setFormat] = useState<RemixFormat>("facebook_post");
  const [tone, setTone] = useState<RemixTone>("friendly");
  const [voiceProfileId, setVoiceProfileId] = useState(defaultVoiceId);

  useEffect(() => {
    setVoiceProfileId(defaultVoiceId);
  }, [defaultVoiceId]);
  const [variantCount, setVariantCount] = useState(DEFAULT_REMIX_VARIANT_COUNT);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (disabled) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await generateRemixAction({
        contentItemId,
        format,
        tone,
        variantCount,
        voiceProfileId: voiceProfileId || null,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onSuccess?.();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-border/60 bg-gradient-brand-soft p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-bold">Tạo remix mới</h2>
          <p className="text-xs text-muted-foreground">
            Mặc định {DEFAULT_REMIX_VARIANT_COUNT} biến thể, tối đa {MAX_REMIX_VARIANT_COUNT}
          </p>
        </div>
      </div>

      {disabled && disabledMessage ? (
        <p className="text-sm text-amber-700 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-2">
          {disabledMessage}
        </p>
      ) : null}

      {voiceProfiles.length > 0 ? (
        <div className="space-y-2">
          <Label htmlFor="remix-voice">Voice profile</Label>
          <select
            id="remix-voice"
            value={voiceProfileId}
            onChange={(event) => setVoiceProfileId(event.target.value)}
            disabled={disabled || isPending}
            className={selectClassName}
          >
            <option value="">Không dùng voice profile</option>
            {voiceProfiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.name}
                {profile.isDefault ? " (mặc định)" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Remix sẽ bám giọng viết đã phân tích.{" "}
            <a href="/voice" className="text-brand hover:underline">
              Quản lý voice
            </a>
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
          Chưa có voice profile.{" "}
          <a href="/voice" className="text-brand hover:underline">
            Tạo tại /voice
          </a>{" "}
          để remix đúng giọng hơn.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="remix-format">Format</Label>
          <select
            id="remix-format"
            value={format}
            onChange={(event) => setFormat(event.target.value as RemixFormat)}
            disabled={disabled || isPending}
            className={selectClassName}
          >
            {REMIX_FORMAT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="remix-tone">Tone</Label>
          <select
            id="remix-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value as RemixTone)}
            disabled={disabled || isPending}
            className={selectClassName}
          >
            {REMIX_TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remix-count">Số biến thể ({variantCount})</Label>
        <input
          id="remix-count"
          type="range"
          min={1}
          max={MAX_REMIX_VARIANT_COUNT}
          value={variantCount}
          onChange={(event) => setVariantCount(Number(event.target.value))}
          disabled={disabled || isPending}
          className="w-full accent-brand"
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      <Button
        type="submit"
        disabled={disabled || isPending}
        className="w-full gap-2 bg-foreground text-background"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang tạo remix…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Tạo {variantCount} biến thể
          </>
        )}
      </Button>
    </form>
  );
}
