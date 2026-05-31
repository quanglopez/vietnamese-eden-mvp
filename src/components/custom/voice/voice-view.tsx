"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mic } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { VoiceProfileDetail } from "@/components/custom/voice/voice-profile-detail";
import { VoiceProfileForm } from "@/components/custom/voice/voice-profile-form";
import type { VoiceProfileView } from "@/types/voice";

type VoiceViewProps = {
  profiles: VoiceProfileView[];
  fetchError: string | null;
};

export function VoiceView({ profiles: initialProfiles, fetchError }: VoiceViewProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialProfiles.find((p) => p.isDefault)?.id ?? initialProfiles[0]?.id ?? null,
  );

  const selected = initialProfiles.find((p) => p.id === selectedId) ?? null;

  return (
    <AppShell
      title="Giọng văn"
      subtitle="Huấn luyện AI học phong cách viết của bạn"
    >
      {fetchError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {fetchError}
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[380px_1fr] gap-8">
        <div className="space-y-6">
          <VoiceProfileForm onSuccess={() => router.refresh()} />

          {initialProfiles.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-surface-elev p-4">
              <h3 className="font-display font-bold text-sm mb-3">
                Profiles của bạn ({initialProfiles.length})
              </h3>
              <ul className="space-y-2">
                {initialProfiles.map((profile) => (
                  <li key={profile.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(profile.id)}
                      className={`w-full text-left rounded-xl px-3 py-2.5 text-sm transition ${
                        selectedId === profile.id
                          ? "bg-brand/10 border border-brand/30"
                          : "hover:bg-muted/50 border border-transparent"
                      }`}
                    >
                      <div className="font-semibold flex items-center gap-2">
                        {profile.name}
                        {profile.isDefault ? (
                          <span className="text-[9px] uppercase text-brand font-bold">Mặc định</span>
                        ) : null}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {profile.tone}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>

        <div>
          {selected ? (
            <VoiceProfileDetail
              profile={selected}
              onDefaultSet={() => router.refresh()}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand-soft grid place-items-center mb-4">
                <Mic className="h-7 w-7 text-brand" />
              </div>
              <p className="font-display font-bold text-lg">Chưa có voice profile</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
                Tạo profile đầu tiên bằng cách dán các bài viết cũ — AI sẽ phân tích tone, từ vựng
                và quy tắc viết để dùng khi remix.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
