"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSourceQualityBadgeVariant,
  getSourceQualityDescription,
  getSourceQualityLabel,
  type SourceQuality,
} from "@/lib/content/analysis-source-quality";
import { cn } from "@/lib/utils";

const METADATA_CALLOUT_TEXT =
  "Kết quả này dựa trên metadata/description, chưa phải transcript đầy đủ. Để phân tích sâu hơn, hãy dán caption/script qua Paste text.";

const BLOCKED_CALLOUT_TEXT =
  "Không lấy được caption/transcript từ link này. Hãy dán caption/script bằng Paste text.";

type SourceQualityBadgeProps = {
  quality: SourceQuality;
  showDescription?: boolean;
  boardId?: string | null;
  className?: string;
};

/**
 * Badge chất lượng nguồn cho AI Breakdown (ALE-158).
 * Dùng heuristic `getSourceQualityFromItem` — chưa đọc DB `source_quality`.
 */
export function SourceQualityBadge({
  quality,
  showDescription = false,
  boardId,
  className,
}: SourceQualityBadgeProps) {
  const label = getSourceQualityLabel(quality);
  const description = getSourceQualityDescription(quality);
  const variant = getSourceQualityBadgeVariant(quality);

  const showMetadataCallout =
    showDescription && quality === "metadata_only";
  const showBlockedCallout =
    showDescription &&
    (quality === "blocked" || quality === "manual_required");

  return (
    <div className={cn("space-y-3", className)}>
      <Badge
        variant={variant}
        title={description ?? label}
        className="text-xs font-semibold"
      >
        {label}
      </Badge>

      {showMetadataCallout ? (
        <div className="rounded-2xl border border-yellow-500/40 bg-yellow-500/5 px-4 py-3 text-sm text-muted-foreground">
          {METADATA_CALLOUT_TEXT}
        </div>
      ) : null}

      {showBlockedCallout ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 px-5 py-4 text-sm">
          <p className="font-semibold text-foreground">Chưa thể phân tích bằng AI</p>
          <p className="mt-2 text-muted-foreground">{BLOCKED_CALLOUT_TEXT}</p>
          {boardId ? (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/boards/${boardId}`}>Quay lại bảng để thêm text</Link>
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
