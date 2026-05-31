"use client";

import { useTransition } from "react";
import { Loader2, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { setDefaultVoiceProfileAction } from "@/lib/voice/actions";
import type { VoiceProfileView } from "@/types/voice";

function formatCreatedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

type VoiceProfileDetailProps = {
  profile: VoiceProfileView;
  onDefaultSet?: () => void;
};

export function VoiceProfileDetail({ profile, onDefaultSet }: VoiceProfileDetailProps) {
  const [isPending, startTransition] = useTransition();

  const handleSetDefault = () => {
    startTransition(async () => {
      const result = await setDefaultVoiceProfileAction(profile.id);
      if (result.success) {
        onDefaultSet?.();
      }
    });
  };

  const { style } = profile;

  return (
    <article className="rounded-2xl border border-border/60 bg-surface-elev p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl font-bold">{profile.name}</h3>
            {profile.isDefault ? (
              <span className="text-[10px] uppercase tracking-wider font-semibold bg-brand/15 text-brand px-2 py-0.5 rounded-full">
                Mặc định
              </span>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.sampleCount} mẫu · Tạo {formatCreatedAt(profile.createdAt)}
          </p>
        </div>
        {!profile.isDefault ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isPending}
            onClick={handleSetDefault}
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Star className="h-3.5 w-3.5" />
            )}
            Đặt mặc định
          </Button>
        ) : null}
      </div>

      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">Tone</h4>
        <p className="text-sm leading-relaxed">{profile.tone}</p>
      </section>

      <div className="grid sm:grid-cols-2 gap-4">
        <Section title="Từ vựng" body={style.vocabulary} />
        <Section title="Kiểu câu" body={style.sentence_style} />
        <Section title="CTA style" body={style.cta_style} />
        <Section title="Cấu trúc nội dung" body={style.content_structure} />
      </div>

      <BulletSection title="Mở bài / Hook hay dùng" items={style.common_openings} />
      <BulletSection title="Kết bài hay dùng" items={style.common_endings} />
      {style.banned_phrases.length > 0 ? (
        <BulletSection title="Cụm nên tránh" items={style.banned_phrases} />
      ) : null}
      <BulletSection title="Quy tắc viết" items={style.writing_rules} />

      {style.description ? (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Mô tả thêm
          </h4>
          <p className="text-sm text-muted-foreground">{style.description}</p>
        </section>
      ) : null}
    </article>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="rounded-xl bg-muted/30 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">{title}</h4>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{body}</p>
    </section>
  );
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-2">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="text-sm pl-3 border-l-2 border-brand/30">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
