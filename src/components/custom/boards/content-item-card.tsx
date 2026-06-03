"use client";

import Link from "next/link";
import { useMemo, useState, type MouseEvent } from "react";
import { Bookmark, Plus, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ContentMediaCover } from "@/components/custom/content/content-media-cover";
import { SourceQualityBadge } from "@/components/custom/breakdown/source-quality-badge";
import { getSourceQualityFromItem } from "@/lib/content/analysis-source-quality";
import { getLinkThumbnailUrl } from "@/lib/content/url-metadata";
import type { BoardContentItem } from "@/types/content";
import type { ManualTag } from "@/types/tags";

type ContentItemCardProps = {
  item: BoardContentItem;
  selectionIndex: number;
  tags: ManualTag[];
  workspaceTags: ManualTag[];
  selected: boolean;
  onSelectToggle: (id: string, mode: "single" | "range") => void;
  onAddTag: (contentItemId: string, tagName: string) => void;
  onToggleTag: (contentItemId: string, tagId: string) => void;
};

export function ContentItemCard({
  item,
  selectionIndex,
  tags,
  workspaceTags,
  selected,
  onSelectToggle,
  onAddTag,
  onToggleTag,
}: ContentItemCardProps) {
  const thumbnailUrl = getLinkThumbnailUrl(item.sourceUrl, item.platform);
  const hasText = Boolean(item.rawContent?.trim());
  const breakdownHref = `/breakdown/${item.id}`;
  const sourceQuality = getSourceQualityFromItem(item);
  const showCompactBadge = sourceQuality !== "paste_text";
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const displayedTags = useMemo(() => tags.slice(0, 3), [tags]);
  const remainingTagCount = Math.max(tags.length - displayedTags.length, 0);

  const handleSelectControl = (
    event: MouseEvent<HTMLElement>,
    mode: "single" | "range",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    onSelectToggle(item.id, mode);
  };

  return (
    <article
      data-content-id={item.id}
      data-index={selectionIndex}
      className={`group rounded-2xl border border-border/60 bg-surface-elev overflow-hidden hover:shadow-card transition flex flex-col ${
        selected ? "ring-2 ring-brand bg-brand/5" : ""
      }`}
    >
      <div className="relative">
        <label className="absolute top-3 left-3 z-30 flex items-center">
          <input
            type="checkbox"
            checked={selected}
            data-testid="content-select-checkbox"
            data-content-id={item.id}
            data-index={selectionIndex}
            className="h-4 w-4 rounded border-border accent-brand cursor-pointer"
            onClick={(event) => {
              if (event.shiftKey) {
                handleSelectControl(event, "range");
                return;
              }
              handleSelectControl(event, "single");
            }}
            onChange={(event) => {
              event.stopPropagation();
            }}
            aria-label={`Chọn ${item.title}`}
          />
        </label>
        <Link
          href={breakdownHref}
          className="block flex-1"
          data-content-id={item.id}
          data-index={selectionIndex}
          onClick={(event) => {
            if (event.shiftKey) {
              handleSelectControl(event, "range");
            }
          }}
        >
          <div className="relative aspect-[4/5]">
            <ContentMediaCover
              platform={item.platform}
              title={item.title}
              rawContent={item.rawContent}
              thumbnailUrl={thumbnailUrl}
              className="h-full"
              previewClassName="text-white font-display font-semibold text-base leading-snug line-clamp-4"
            />
            <span className="absolute top-3 right-3 z-20 h-7 w-7 rounded-full bg-black/30 backdrop-blur grid place-items-center">
              <Bookmark className="h-3.5 w-3.5 text-white" />
            </span>
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
      </div>
      <div className="px-4 pb-4 space-y-2">
        {showCompactBadge ? (
          <SourceQualityBadge quality={sourceQuality} showDescription={false} />
        ) : null}
        {tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {displayedTags.map((tag) => (
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
            {remainingTagCount > 0 ? (
              <Badge variant="outline" className="text-[11px]">
                +{remainingTagCount}
              </Badge>
            ) : null}
          </div>
        ) : null}
        <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full gap-2"
            data-testid="manage-tags-button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setTagDialogOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Quản lý tag
          </Button>
          <DialogContent
            className="max-w-md"
            data-testid="tag-manager-dialog"
            onPointerDownOutside={(event) => {
              event.preventDefault();
            }}
          >
            <DialogHeader>
              <DialogTitle>Quản lý tag</DialogTitle>
              <DialogDescription>
                Thêm tag mới hoặc bật/tắt tag cho content này.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(event) => setNewTagName(event.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background px-2 text-xs"
                  placeholder="Tag mới..."
                  aria-label="Tag mới cho content"
                  data-testid="tag-input"
                />
                <Button
                  type="button"
                  size="sm"
                  data-testid="create-tag-button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    const tagName = newTagName.trim();
                    if (!tagName) {
                      return;
                    }
                    onAddTag(item.id, tagName);
                    setNewTagName("");
                  }}
                >
                  Thêm
                </Button>
              </div>
              <div className="flex flex-wrap gap-1">
                {workspaceTags.length > 0 ? (
                  workspaceTags.map((tag) => {
                    const assigned = tags.some((current) => current.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          onToggleTag(item.id, tag.id);
                        }}
                        className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${
                          assigned
                            ? "border-foreground/20 bg-foreground/10"
                            : "border-border bg-background"
                        }`}
                      >
                        <span>{tag.name}</span>
                        {assigned ? <X className="h-3 w-3" /> : null}
                      </button>
                    );
                  })
                ) : (
                  <p className="text-[11px] text-muted-foreground">Chưa có tag trong board.</p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
            Chỉ có URL — mở Breakdown để thử lấy metadata, hoặc dán caption qua Paste text.
          </p>
        ) : null}
      </div>
    </article>
  );
}
