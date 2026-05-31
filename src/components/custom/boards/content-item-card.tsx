"use client";

import Link from "next/link";
import { Bookmark, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getContentPreview,
  getPlatformGradient,
  getPlatformLabel,
} from "@/lib/content/platform-styles";
import type { BoardContentItem } from "@/types/content";

type ContentItemCardProps = {
  item: BoardContentItem;
};

export function ContentItemCard({ item }: ContentItemCardProps) {
  const preview = getContentPreview(item.title, item.rawContent);
  const gradient = getPlatformGradient(item.platform);
  const hasText = Boolean(item.rawContent?.trim());
  const breakdownHref = `/breakdown/${item.id}`;

  return (
    <article className="group rounded-2xl border border-border/60 bg-surface-elev overflow-hidden hover:shadow-card transition flex flex-col">
      <Link href={breakdownHref} className="block flex-1">
        <div
          className={`aspect-[4/5] bg-gradient-to-br ${gradient} p-4 flex flex-col justify-between relative`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-white bg-black/30 backdrop-blur px-2 py-0.5 rounded-full">
              {getPlatformLabel(item.platform)}
            </span>
            <span className="h-7 w-7 rounded-full bg-black/30 backdrop-blur grid place-items-center">
              <Bookmark className="h-3.5 w-3.5 text-white" />
            </span>
          </div>
          <div className="text-white font-display font-semibold text-base leading-snug line-clamp-4">
            {preview}
          </div>
        </div>
        <div className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2 text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-sm truncate">
                {item.authorName ?? item.title}
              </div>
              {item.sourceUrl ? (
                <div className="text-muted-foreground truncate">{item.sourceUrl}</div>
              ) : (
                <div className="text-muted-foreground">Nội dung đã lưu</div>
              )}
            </div>
            <Sparkles className="h-4 w-4 text-brand opacity-0 group-hover:opacity-100 transition shrink-0" />
          </div>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <Button
          asChild
          variant={hasText ? "default" : "outline"}
          size="sm"
          className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
        >
          <Link href={breakdownHref}>
            <Sparkles className="h-3.5 w-3.5" />
            Phân tích AI
          </Link>
        </Button>
        {!hasText ? (
          <p className="mt-2 text-[11px] text-muted-foreground leading-snug">
            Chỉ có URL — thêm nội dung text trước khi phân tích.
          </p>
        ) : null}
      </div>
    </article>
  );
}
