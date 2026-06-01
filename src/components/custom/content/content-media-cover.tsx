import Image from "next/image";

import {
  getContentPreview,
  getPlatformGradient,
  getPlatformLabel,
} from "@/lib/content/platform-styles";
import type { PlatformType } from "@/types/content";

type ContentMediaCoverProps = {
  platform: PlatformType;
  title: string;
  rawContent: string | null;
  thumbnailUrl?: string | null;
  className?: string;
  badgeClassName?: string;
  previewClassName?: string;
};

export function ContentMediaCover({
  platform,
  title,
  rawContent,
  thumbnailUrl,
  className = "",
  badgeClassName = "",
  previewClassName = "text-white font-display font-bold text-xl leading-tight line-clamp-6",
}: ContentMediaCoverProps) {
  const preview = getContentPreview(title, rawContent);
  const gradient = getPlatformGradient(platform);
  const hasThumbnail = Boolean(thumbnailUrl?.trim());

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br ${gradient} ${className}`}
    >
      {hasThumbnail ? (
        <>
          <Image
            src={thumbnailUrl!}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 360px, 400px"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />
        </>
      ) : null}

      <div className="relative z-10 flex h-full flex-col justify-between p-5">
        <span
          className={`text-[10px] font-bold text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded-full w-fit ${badgeClassName}`}
        >
          {getPlatformLabel(platform)}
        </span>
        {!hasThumbnail ? (
          <div className={previewClassName}>{preview}</div>
        ) : (
          <div className="text-white font-display font-semibold text-lg leading-tight line-clamp-3 drop-shadow">
            {preview}
          </div>
        )}
      </div>
    </div>
  );
}
