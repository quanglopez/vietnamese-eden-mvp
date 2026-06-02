"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  FolderOpen,
  Grid3x3,
  List,
  Plus,
  SearchX,
  Share2,
  Sparkles,
  X,
} from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatBoardUpdatedAt } from "@/lib/boards/constants";
import type { BoardDetail } from "@/types/boards";
import type { BoardContentItem } from "@/types/content";

import { AddContentModal } from "./add-content-modal";
import { ContentItemCard } from "./content-item-card";

type BoardDetailViewProps = {
  board: BoardDetail;
  items: BoardContentItem[];
  fetchError: string | null;
};

const FILTER_PLATFORMS = [
  "tiktok",
  "instagram",
  "youtube",
  "facebook",
  "linkedin",
  "other",
] as const;

type FilterPlatform = (typeof FILTER_PLATFORMS)[number];

const FILTER_PLATFORM_LABELS: Record<FilterPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  other: "Other",
};

function getItemFilterPlatform(item: BoardContentItem): FilterPlatform {
  if (item.platform !== "other") {
    return item.platform;
  }
  const source = item.sourceUrl?.toLowerCase() ?? "";
  if (source.includes("linkedin.com")) {
    return "linkedin";
  }
  return "other";
}

export function BoardDetailView({ board, items, fetchError }: BoardDetailViewProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activePlatforms, setActivePlatforms] =
    useState<FilterPlatform[]>([...FILTER_PLATFORMS]);

  const subtitle = `${board.contentCount} nội dung đã lưu · Cập nhật ${formatBoardUpdatedAt(board.updatedAt)}`;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddSuccess = (message: string) => {
    setSuccessMessage(message);
    router.refresh();
  };

  const togglePlatform = (platform: FilterPlatform) => {
    setActivePlatforms((prev) => {
      if (prev.includes(platform)) {
        const next = prev.filter((value) => value !== platform);
        return next.length > 0 ? next : prev;
      }
      return [...prev, platform];
    });
  };

  const resetPlatformFilter = () => {
    setActivePlatforms([...FILTER_PLATFORMS]);
  };

  const isAllSelected = activePlatforms.length === FILTER_PLATFORMS.length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const inPlatform = activePlatforms.includes(getItemFilterPlatform(item));
      if (!inPlatform) {
        return false;
      }
      if (!debouncedQuery) {
        return true;
      }
      const haystack = `${item.title} ${item.rawContent ?? ""} ${item.sourceUrl ?? ""}`.toLowerCase();
      return haystack.includes(debouncedQuery);
    });
  }, [activePlatforms, debouncedQuery, items]);

  const hasSearch = debouncedQuery.length > 0;
  const hasPlatformFilter = !isAllSelected;
  const platformFilteredOnlyEmpty =
    filteredItems.length === 0 && !hasSearch && hasPlatformFilter;
  const selectedPlatformText = activePlatforms
    .map((platform) => FILTER_PLATFORM_LABELS[platform])
    .join(", ");

  return (
    <AppShell title={board.name} subtitle={subtitle}>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href="/boards">
            <ArrowLeft className="h-4 w-4" />
            Quay lại bảng cảm hứng
          </Link>
        </Button>
      </div>

      {fetchError ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Không tải được nội dung: {fetchError}
        </div>
      ) : null}

      {successMessage ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-brand/30 bg-gradient-brand-soft px-4 py-3 text-sm">
          <CheckCircle2 className="h-5 w-5 text-brand shrink-0 mt-0.5" />
          <p className="flex-1 text-foreground">{successMessage}</p>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Đóng thông báo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div
        className={`rounded-3xl bg-gradient-to-br ${board.gradientClass} p-8 mb-8 text-white relative overflow-hidden`}
      >
        <div className="absolute -top-10 -right-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-5xl mb-3">{board.emoji}</div>
            <h1 className="font-display text-3xl md:text-4xl font-extrabold">{board.name}</h1>
            <p className="mt-2 text-white/85 max-w-xl">
              {board.description ??
                "Bộ sưu tập nội dung viral để phân tích công thức và remix mỗi tuần."}
            </p>
            <p className="mt-3 text-xs text-white/70">
              Tạo {new Date(board.createdAt).toLocaleDateString("vi-VN")} ·{" "}
              {board.contentCount} mục
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled
              title="Sắp ra mắt"
              className="border-white/40 text-white hover:bg-white/10 bg-transparent gap-2"
            >
              <Share2 className="h-4 w-4" /> Chia sẻ
            </Button>
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-white text-foreground hover:bg-white/90 gap-2"
            >
              <Plus className="h-4 w-4" /> Thêm content
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            aria-label="Tìm kiếm content"
            placeholder="Tìm theo tiêu đề, nội dung hoặc URL..."
            className="h-10 pr-10"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
              aria-label="Xóa tìm kiếm"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={isAllSelected ? "default" : "outline"}
            size="sm"
            onClick={resetPlatformFilter}
          >
            Tất cả
          </Button>
          {FILTER_PLATFORMS.map((platform) => {
            const active = activePlatforms.includes(platform);
            return (
              <Button
                key={platform}
                type="button"
                variant={active ? "default" : "outline"}
                size="sm"
                aria-label={`Lọc nền tảng ${FILTER_PLATFORM_LABELS[platform]}`}
                onClick={() => togglePlatform(platform)}
              >
                {FILTER_PLATFORM_LABELS[platform]}
              </Button>
            );
          })}
          <div className="ml-auto flex gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Lưới">
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            disabled
            title="Sắp ra mắt"
            aria-label="Danh sách"
          >
            <List className="h-4 w-4" />
          </Button>
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface-elev/50 p-12 text-center max-w-lg mx-auto">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-brand-soft grid place-items-center mb-4">
            <FolderOpen className="h-7 w-7 text-brand" />
          </div>
          <h2 className="font-display text-xl font-bold">Chưa có nội dung nào</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Thêm link hoặc caption đầu tiên vào bảng này để bắt đầu phân tích và remix.
          </p>
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-6 bg-gradient-brand text-white shadow-glow gap-2"
          >
            <Sparkles className="h-4 w-4" /> Thêm content
          </Button>
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => (
            <ContentItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/80 bg-surface-elev/40 p-12 text-center max-w-xl mx-auto">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-muted grid place-items-center mb-4">
            <SearchX className="h-7 w-7 text-muted-foreground" />
          </div>
          {hasSearch ? (
            <>
              <h2 className="font-display text-xl font-bold">
                Không tìm thấy content với từ khóa &quot;{debouncedQuery}&quot;
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy thử từ khóa khác hoặc bỏ bớt bộ lọc nền tảng.
              </p>
            </>
          ) : platformFilteredOnlyEmpty ? (
            <>
              <h2 className="font-display text-xl font-bold">
                Không có content {selectedPlatformText} trong board này
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy chọn nền tảng khác hoặc thêm content mới.
              </p>
            </>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold">Không có content phù hợp</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Điều chỉnh từ khóa tìm kiếm hoặc bộ lọc để xem thêm nội dung.
              </p>
            </>
          )}
          <Button
            onClick={() => setAddOpen(true)}
            className="mt-6 bg-gradient-brand text-white shadow-glow gap-2"
          >
            <Sparkles className="h-4 w-4" /> Thêm content
          </Button>
        </div>
      )}

      <AddContentModal
        boardId={board.id}
        boardName={board.name}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleAddSuccess}
      />
    </AppShell>
  );
}
