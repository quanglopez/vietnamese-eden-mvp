"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRightLeft,
  CheckCircle2,
  FolderOpen,
  Grid3x3,
  List,
  Plus,
  Save,
  SearchX,
  Share2,
  Sparkles,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { FetchErrorBanner } from "@/components/custom/app/fetch-error-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatBoardUpdatedAt } from "@/lib/boards/constants";
import {
  createSavedViewAction,
  deleteSavedViewAction,
} from "@/lib/boards/saved-views-actions";
import {
  bulkAddTagAction,
  bulkMoveToBoardAction,
  bulkUnlinkFromBoardAction,
} from "@/lib/content/bulk-actions";
import {
  assignTagToContent,
  createTag,
  deleteTag,
  removeTagFromContent,
} from "@/lib/content/tag-actions";
import type {
  BoardDetail,
  BoardListItem,
  BoardSavedView,
  SavedBoardViewPlatform,
} from "@/types/boards";
import type { BoardContentItem } from "@/types/content";
import type { ManualTag } from "@/types/tags";

import { AddContentModal } from "./add-content-modal";
import { ContentItemCard } from "./content-item-card";

type BoardDetailViewProps = {
  board: BoardDetail;
  items: BoardContentItem[];
  workspaceTags: ManualTag[];
  savedViews: BoardSavedView[];
  workspaceBoards: BoardListItem[];
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
const TAG_COLORS = ["#bfdbfe", "#fed7aa", "#fde68a", "#fecdd3", "#bbf7d0", "#ddd6fe", "#d9f99d"] as const;

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

export function BoardDetailView({
  board,
  items,
  workspaceTags,
  savedViews,
  workspaceBoards,
  fetchError,
}: BoardDetailViewProps) {
  const router = useRouter();
  const [addOpen, setAddOpen] = useState(false);
  const [prefillSample, setPrefillSample] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tagFeedback, setTagFeedback] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activePlatforms, setActivePlatforms] =
    useState<FilterPlatform[]>([...FILTER_PLATFORMS]);
  const [activeTagIds, setActiveTagIds] = useState<string[]>([]);
  const [isTagPending, startTagTransition] = useTransition();
  const [isViewPending, startViewTransition] = useTransition();
  const [saveViewOpen, setSaveViewOpen] = useState(false);
  const [saveViewName, setSaveViewName] = useState("");
  const [viewFeedback, setViewFeedback] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [bulkUnlinkOpen, setBulkUnlinkOpen] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState<string | null>(null);
  const [isBulkPending, startBulkTransition] = useTransition();
  const lastSelectedContentIdRef = useRef<string | null>(null);

  const subtitle = `${board.contentCount} nội dung đã lưu · Cập nhật ${formatBoardUpdatedAt(board.updatedAt)}`;
  const otherBoards = useMemo(
    () => workspaceBoards.filter((b) => b.id !== board.id),
    [workspaceBoards, board.id],
  );
  const selectedCount = selectedIds.size;
  const selectedIdList = useMemo(() => Array.from(selectedIds), [selectedIds]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const currentFilters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const platformsToSave: SavedBoardViewPlatform[] | null =
      activePlatforms.length === FILTER_PLATFORMS.length
        ? null
        : (activePlatforms as SavedBoardViewPlatform[]);
    const tagsToSave = activeTagIds.length > 0 ? activeTagIds : null;
    return {
      searchQuery: normalizedQuery.length > 0 ? normalizedQuery : null,
      platformFilters: platformsToSave ? new Set(platformsToSave) : null,
      tagFilters: tagsToSave ? new Set(tagsToSave) : null,
    };
  }, [activePlatforms, activeTagIds, searchQuery]);

  const activeSavedViewId = useMemo(() => {
    for (const view of savedViews) {
      const viewQuery = view.searchQuery?.trim().toLowerCase() ?? null;
      if ((currentFilters.searchQuery ?? null) !== viewQuery) {
        continue;
      }

      const viewPlatforms = view.platformFilters;
      if (currentFilters.platformFilters === null) {
        if (viewPlatforms !== null) {
          continue;
        }
      } else {
        if (!viewPlatforms) {
          continue;
        }
        const platformSet = new Set(viewPlatforms);
        if (platformSet.size !== currentFilters.platformFilters.size) {
          continue;
        }
        let ok = true;
        for (const p of currentFilters.platformFilters) {
          if (!platformSet.has(p)) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          continue;
        }
      }

      const viewTags = view.tagFilters;
      if (currentFilters.tagFilters === null) {
        if (viewTags !== null) {
          continue;
        }
      } else {
        if (!viewTags) {
          continue;
        }
        const tagSet = new Set(viewTags);
        if (tagSet.size !== currentFilters.tagFilters.size) {
          continue;
        }
        let ok = true;
        for (const t of currentFilters.tagFilters) {
          if (!tagSet.has(t)) {
            ok = false;
            break;
          }
        }
        if (!ok) {
          continue;
        }
      }

      return view.id;
    }
    return null;
  }, [currentFilters, savedViews]);

  const applySavedView = (view: BoardSavedView) => {
    setViewFeedback(null);
    setSuccessMessage(`Đã áp dụng view "${view.name}".`);
    setSearchQuery(view.searchQuery ?? "");
    const platforms =
      view.platformFilters && view.platformFilters.length > 0
        ? (view.platformFilters as FilterPlatform[])
        : [...FILTER_PLATFORMS];
    setActivePlatforms(platforms);
    setActiveTagIds(view.tagFilters ?? []);
  };

  const openSaveView = () => {
    const defaultName = `Xem lọc ${new Date().toLocaleDateString("vi-VN")}`;
    setSaveViewName(defaultName);
    setViewFeedback(null);
    setSaveViewOpen(true);
  };

  const handleCreateSavedView = () => {
    setViewFeedback(null);
    startViewTransition(async () => {
      const result = await createSavedViewAction({
        boardId: board.id,
        workspaceId: board.workspaceId,
        name: saveViewName,
        searchQuery: searchQuery.trim() ? searchQuery : null,
        platformFilters:
          activePlatforms.length === FILTER_PLATFORMS.length
            ? null
            : (activePlatforms as SavedBoardViewPlatform[]),
        tagFilters: activeTagIds.length > 0 ? activeTagIds : null,
        sortOrder: 0,
      });
      if (!result.success) {
        setViewFeedback(result.error);
        return;
      }
      setSaveViewOpen(false);
      setSuccessMessage("Đã lưu bộ lọc.");
      router.refresh();
    });
  };

  const handleDeleteSavedView = (view: BoardSavedView) => {
    setViewFeedback(null);
    startViewTransition(async () => {
      const confirmed = window.confirm(`Xóa saved view "${view.name}"?`);
      if (!confirmed) {
        return;
      }
      const result = await deleteSavedViewAction({ boardId: board.id, viewId: view.id });
      if (!result.success) {
        setViewFeedback(result.error);
        return;
      }
      setSuccessMessage("Đã xóa saved view.");
      router.refresh();
    });
  };

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

  const addTagToItem = (contentItemId: string, tagName: string) => {
    const normalizedName = tagName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .toLowerCase();

    if (!normalizedName) {
      return;
    }

    startTagTransition(async () => {
      const existingGlobalTag = workspaceTags.find(
        (tag) =>
          tag.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase() === normalizedName,
      );

      const pickedColor = TAG_COLORS[workspaceTags.length % TAG_COLORS.length] ?? null;
      const created = existingGlobalTag
        ? { success: true as const, data: { tag: existingGlobalTag } }
        : await createTag({
            workspaceId: board.workspaceId,
            name: tagName.trim(),
            color: pickedColor,
            boardId: board.id,
          });

      if (!created.success) {
        setTagFeedback(created.error);
        return;
      }

      const assigned = await assignTagToContent({
        contentItemId,
        tagId: created.data.tag.id,
        boardId: board.id,
      });

      if (!assigned.success) {
        setTagFeedback(assigned.error);
        return;
      }

      setTagFeedback("Đã cập nhật tag.");
      router.refresh();
    });
  };

  const toggleTagOnItem = (contentItemId: string, tagId: string) => {
    const item = items.find((candidate) => candidate.id === contentItemId);
    const exists = item?.tags.some((tag) => tag.id === tagId) ?? false;
    startTagTransition(async () => {
      const result = exists
        ? await removeTagFromContent({ contentItemId, tagId, boardId: board.id })
        : await assignTagToContent({ contentItemId, tagId, boardId: board.id });
      if (!result.success) {
        setTagFeedback(result.error);
        return;
      }
      setTagFeedback("Đã cập nhật tag.");
      router.refresh();
    });
  };

  const deleteTagFromWorkspace = (tagId: string) => {
    startTagTransition(async () => {
      const confirmed = window.confirm(
        "Xóa tag này khỏi workspace? Tag sẽ bị gỡ khỏi tất cả content.",
      );
      if (!confirmed) {
        return;
      }
      const result = await deleteTag({ tagId, boardId: board.id });
      if (!result.success) {
        setTagFeedback(result.error);
        return;
      }
      setTagFeedback("Đã xóa tag.");
      setActiveTagIds((prev) => prev.filter((id) => id !== tagId));
      router.refresh();
    });
  };

  const toggleTagFilter = (tagId: string) => {
    setActiveTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((value) => value !== tagId) : [...prev, tagId],
    );
  };

  const clearTagFilter = () => {
    setActiveTagIds([]);
  };

  const isAllSelected = activePlatforms.length === FILTER_PLATFORMS.length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const inPlatform = activePlatforms.includes(getItemFilterPlatform(item));
      if (!inPlatform) {
        return false;
      }
      if (activeTagIds.length > 0) {
        const currentTags = item.tags ?? [];
        const hasSelectedTag = currentTags.some((tag) => activeTagIds.includes(tag.id));
        if (!hasSelectedTag) {
          return false;
        }
      }
      if (!debouncedQuery) {
        return true;
      }
      const haystack = `${item.title} ${item.rawContent ?? ""} ${item.sourceUrl ?? ""}`.toLowerCase();
      return haystack.includes(debouncedQuery);
    });
  }, [activePlatforms, activeTagIds, debouncedQuery, items]);

  const hasSearch = debouncedQuery.length > 0;
  const hasPlatformFilter = !isAllSelected;
  const hasTagFilter = activeTagIds.length > 0;
  const platformFilteredOnlyEmpty =
    filteredItems.length === 0 && !hasSearch && hasPlatformFilter;
  const tagFilteredOnlyEmpty = filteredItems.length === 0 && !hasSearch && hasTagFilter;
  const selectedPlatformText = activePlatforms
    .map((platform) => FILTER_PLATFORM_LABELS[platform])
    .join(", ");
  const selectedTagText = workspaceTags
    .filter((tag) => activeTagIds.includes(tag.id))
    .map((tag) => tag.name)
    .join(", ");

  const clearSelection = () => {
    setSelectedIds(new Set());
    lastSelectedContentIdRef.current = null;
  };

  const handleSelectToggle = (id: string, mode: "single" | "range", index: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (mode === "range") {
        const anchorId = lastSelectedContentIdRef.current;
        const anchorIndex =
          anchorId !== null
            ? filteredItems.findIndex((item) => item.id === anchorId)
            : -1;
        if (anchorIndex >= 0) {
          const start = Math.min(anchorIndex, index);
          const end = Math.max(anchorIndex, index);
          for (let i = start; i <= end; i++) {
            const item = filteredItems[i];
            if (item) {
              next.add(item.id);
            }
          }
        } else {
          next.add(id);
        }
      } else if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
    lastSelectedContentIdRef.current = id;
  };

  const handleBulkAddTag = (tagId: string, tagName: string) => {
    if (selectedCount === 0) {
      return;
    }
    setBulkFeedback(null);
    startBulkTransition(async () => {
      const result = await bulkAddTagAction({
        contentItemIds: selectedIdList,
        tagId,
        boardId: board.id,
      });
      if (!result.success) {
        setBulkFeedback(result.error);
        return;
      }
      const { updated, failed } = result.data;
      setSuccessMessage(
        failed > 0
          ? `Đã thêm tag "${tagName}" cho ${updated} nội dung (${failed} lỗi).`
          : `Đã thêm tag "${tagName}" cho ${updated} nội dung.`,
      );
      clearSelection();
      router.refresh();
    });
  };

  const handleBulkUnlinkFromBoard = () => {
    if (selectedCount === 0) {
      return;
    }
    setBulkFeedback(null);
    startBulkTransition(async () => {
      const result = await bulkUnlinkFromBoardAction({
        contentItemIds: selectedIdList,
        boardId: board.id,
      });
      if (!result.success) {
        setBulkFeedback(result.error);
        return;
      }
      setBulkUnlinkOpen(false);
      setSuccessMessage(`Đã gỡ ${result.data.removed} nội dung khỏi bảng.`);
      clearSelection();
      router.refresh();
    });
  };

  const handleBulkMove = (targetBoardId: string, targetBoardName: string) => {
    if (selectedCount === 0) {
      return;
    }
    setBulkFeedback(null);
    startBulkTransition(async () => {
      const result = await bulkMoveToBoardAction({
        contentItemIds: selectedIdList,
        sourceBoardId: board.id,
        targetBoardId,
      });
      if (!result.success) {
        setBulkFeedback(result.error);
        return;
      }
      setSuccessMessage(`Đã chuyển ${result.data.moved} nội dung sang bảng "${targetBoardName}".`);
      clearSelection();
      router.refresh();
    });
  };

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
        <FetchErrorBanner message={`Không tải được nội dung: ${fetchError}`} />
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
      {tagFeedback ? (
        <div className="mb-4 rounded-lg border border-border/60 bg-surface-elev px-3 py-2 text-sm">
          {tagFeedback}
        </div>
      ) : null}
      {viewFeedback ? (
        <div className="mb-4 rounded-lg border border-border/60 bg-surface-elev px-3 py-2 text-sm">
          {viewFeedback}
        </div>
      ) : null}
      {bulkFeedback ? (
        <div className="mb-4 rounded-lg border border-border/60 bg-surface-elev px-3 py-2 text-sm">
          {bulkFeedback}
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
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[240px]">
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

          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={openSaveView}
            disabled={isViewPending}
          >
            <Save className="h-4 w-4" />
            Lưu bộ lọc
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="gap-2" disabled={isViewPending}>
                <FolderOpen className="h-4 w-4" />
                Saved views
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>Saved views</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {savedViews.length === 0 ? (
                <DropdownMenuItem disabled>Chưa có saved view nào.</DropdownMenuItem>
              ) : (
                savedViews.map((view) => (
                  <DropdownMenuItem
                    key={view.id}
                    onSelect={() => applySavedView(view)}
                    className="flex items-center justify-between gap-2"
                  >
                    <span className="truncate">
                      {activeSavedViewId === view.id ? "✓ " : ""}
                      {view.name}
                    </span>
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteSavedView(view);
                      }}
                      aria-label={`Xóa saved view ${view.name}`}
                      disabled={isViewPending}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
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
          <Button variant="ghost" size="icon" className="h-11 w-11" aria-label="Lưới">
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11"
            disabled
            title="Sắp ra mắt"
            aria-label="Danh sách"
          >
            <List className="h-4 w-4" />
          </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {workspaceTags.length > 0 ? (
            workspaceTags.map((tag) => {
              const active = activeTagIds.includes(tag.id);
              return (
                <div
                  key={tag.id}
                  className={`inline-flex items-center rounded-md border ${
                    active ? "border-foreground/25 bg-foreground/10" : "border-border bg-background"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTagFilter(tag.id)}
                    className="px-1 py-1 text-xs"
                    aria-label={`Lọc tag ${tag.name}`}
                  >
                    <Badge
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
                  </button>
                  <button
                    type="button"
                    className="pr-1 text-muted-foreground hover:text-foreground"
                    aria-label={`Xóa tag ${tag.name}`}
                    onClick={() => deleteTagFromWorkspace(tag.id)}
                    disabled={isTagPending}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-muted-foreground">Chưa có tag.</p>
          )}
          {hasTagFilter ? (
            <Button type="button" variant="outline" size="sm" onClick={clearTagFilter}>
              Xóa tag filter
            </Button>
          ) : null}
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
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <Button
              onClick={() => setAddOpen(true)}
              className="bg-gradient-brand text-white shadow-glow gap-2"
            >
              <Sparkles className="h-4 w-4" /> Thêm content
            </Button>
            <span className="text-xs text-muted-foreground">hoặc</span>
            <Button
              variant="outline"
              onClick={() => {
                setPrefillSample(true);
                setAddOpen(true);
              }}
              className="gap-2"
              data-testid="try-sample-content-button"
            >
              Thử nội dung mẫu
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            Chưa có content? Dùng nội dung mẫu Việt Nam có sẵn để trải nghiệm nhanh.
          </p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div
          className={`grid sm:grid-cols-2 lg:grid-cols-3 gap-5 ${selectedCount > 0 ? "pb-24" : ""}`}
        >
          {filteredItems.map((item, index) => (
            <ContentItemCard
              key={item.id}
              item={item}
              selectionIndex={index}
              tags={item.tags}
              workspaceTags={workspaceTags}
              selected={selectedIds.has(item.id)}
              onSelectToggle={(id, mode) => handleSelectToggle(id, mode, index)}
              onAddTag={addTagToItem}
              onToggleTag={toggleTagOnItem}
            />
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
          ) : tagFilteredOnlyEmpty ? (
            <>
              <h2 className="font-display text-xl font-bold">
                {hasPlatformFilter
                  ? `Không có content ${selectedPlatformText} được gắn tag "${selectedTagText}"`
                  : `Không có content nào được gắn tag "${selectedTagText}"`}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hãy chọn tag khác hoặc thêm tag cho content phù hợp.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={clearTagFilter}
              >
                Xóa tag filter
              </Button>
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
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setPrefillSample(false);
        }}
        onSuccess={handleAddSuccess}
        defaultFillSample={prefillSample}
      />

      {selectedCount > 0 ? (
        <div
          className="fixed bottom-6 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-background/95 px-4 py-3 shadow-lg backdrop-blur"
          data-testid="bulk-action-toolbar"
        >
          <span className="text-sm font-medium shrink-0">
            Đã chọn {selectedCount} nội dung
          </span>
          <div className="flex flex-wrap items-center gap-2 ml-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isBulkPending || selectedCount === 0 || workspaceTags.length === 0}
                >
                  <Tag className="h-4 w-4" />
                  Thêm tag
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Chọn tag</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {workspaceTags.length === 0 ? (
                  <DropdownMenuItem disabled>Chưa có tag.</DropdownMenuItem>
                ) : (
                  workspaceTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag.id}
                      onSelect={() => handleBulkAddTag(tag.id, tag.name)}
                    >
                      {tag.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  disabled={isBulkPending || selectedCount === 0 || otherBoards.length === 0}
                  title={
                    otherBoards.length === 0
                      ? "Không có bảng khác trong workspace."
                      : undefined
                  }
                >
                  <ArrowRightLeft className="h-4 w-4" />
                  Chuyển board
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Chọn bảng đích</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {otherBoards.length === 0 ? (
                  <DropdownMenuItem disabled>Không có bảng khác.</DropdownMenuItem>
                ) : (
                  otherBoards.map((target) => (
                    <DropdownMenuItem
                      key={target.id}
                      onSelect={() => handleBulkMove(target.id, target.name)}
                    >
                      {target.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="gap-2"
              disabled={isBulkPending || selectedCount === 0}
              onClick={() => setBulkUnlinkOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Gỡ khỏi board
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isBulkPending}
            >
              Bỏ chọn
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={bulkUnlinkOpen} onOpenChange={setBulkUnlinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gỡ khỏi bảng</DialogTitle>
            <DialogDescription>
              {selectedCount} nội dung đã chọn sẽ được gỡ khỏi bảng &quot;{board.name}&quot; —
              không xóa vĩnh viễn khỏi workspace. Nội dung gốc vẫn giữ trong thư viện workspace;
              nếu mục đó còn ở bảng khác, bạn vẫn thấy ở các bảng đó.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setBulkUnlinkOpen(false)}>
              Huỷ
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkUnlinkFromBoard}
              disabled={isBulkPending || selectedCount === 0}
            >
              Gỡ {selectedCount} mục khỏi bảng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={saveViewOpen} onOpenChange={setSaveViewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lưu bộ lọc</DialogTitle>
            <DialogDescription>
              Lưu lại search + platform + tag filter hiện tại để dùng lại nhanh.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="saved-view-name">
              Tên view
            </label>
            <Input
              id="saved-view-name"
              value={saveViewName}
              onChange={(e) => setSaveViewName(e.target.value)}
              disabled={isViewPending}
              placeholder="VD: Viral Hooks"
            />
          </div>

          {viewFeedback ? (
            <div className="rounded-lg border border-border/60 bg-surface-elev px-3 py-2 text-sm">
              {viewFeedback}
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setSaveViewOpen(false)}>
              Huỷ
            </Button>
            <Button type="button" onClick={handleCreateSavedView} disabled={isViewPending}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
