"use client";

import { useEffect, useState, useTransition } from "react";
import { ClipboardPaste, Link2, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { addContentTextAction, addContentUrlAction } from "@/lib/content/actions";
import {
  detectPlatformFromUrl,
  generateTitleFromUrl,
  normalizeSourceUrl,
} from "@/lib/content/platform-detect";
import { PLATFORM_OPTIONS } from "@/lib/validations/content";
import type { PlatformType } from "@/types/content";

type AddContentModalProps = {
  boardId: string;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

type FieldErrors = {
  form?: string;
};

export function AddContentModal({
  boardId,
  boardName,
  open,
  onOpenChange,
  onSuccess,
}: AddContentModalProps) {
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("other");
  const [optionalSourceUrl, setOptionalSourceUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [urlTitle, setUrlTitle] = useState("");
  const [urlTitleTouched, setUrlTitleTouched] = useState(false);
  const [detectedLabel, setDetectedLabel] = useState("Website");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!sourceUrl.trim()) {
      setDetectedLabel("Website");
      if (!urlTitleTouched) {
        setUrlTitle("");
      }
      return;
    }

    try {
      const normalized = normalizeSourceUrl(sourceUrl);
      const detected = detectPlatformFromUrl(normalized);
      setDetectedLabel(detected.label);
      if (!urlTitleTouched) {
        setUrlTitle(generateTitleFromUrl(normalized));
      }
    } catch {
      setDetectedLabel("Website");
    }
  }, [sourceUrl, urlTitleTouched]);

  const resetForm = () => {
    setActiveTab("url");
    setTitle("");
    setRawContent("");
    setPlatform("other");
    setOptionalSourceUrl("");
    setSourceUrl("");
    setUrlTitle("");
    setUrlTitleTouched(false);
    setDetectedLabel("Website");
    setErrors({});
  };

  const handleTextSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result = await addContentTextAction({
        boardId,
        title,
        rawContent,
        platform,
        sourceUrl: optionalSourceUrl.trim() || undefined,
      });

      if (!result.success) {
        setErrors({ form: result.error });
        return;
      }

      const savedTitle = title.trim();
      resetForm();
      onOpenChange(false);
      onSuccess?.(`Đã thêm "${savedTitle}" vào bảng ${boardName}.`);
    });
  };

  const handleUrlSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result = await addContentUrlAction({
        boardId,
        sourceUrl,
        title: urlTitle.trim() || undefined,
      });

      if (!result.success) {
        setErrors({ form: result.error });
        return;
      }

      const savedTitle = urlTitle.trim() || generateTitleFromUrl(normalizeSourceUrl(sourceUrl));
      resetForm();
      onOpenChange(false);
      onSuccess?.(
        `Đã lưu link ${result.data.platformLabel} "${savedTitle}" vào bảng ${boardName}. Nội dung chưa được trích xuất — trạng thái manual_required.`,
      );
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !isPending) {
          resetForm();
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Thêm content</DialogTitle>
          <DialogDescription>
            Lưu vào bảng{" "}
            <span className="font-semibold text-foreground">{boardName}</span> bằng link hoặc
            caption thủ công.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "url" | "text")}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" /> Dán link
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <ClipboardPaste className="h-4 w-4" /> Paste text
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="url-source">Link nguồn</Label>
                <Input
                  id="url-source"
                  type="url"
                  placeholder="https://www.tiktok.com/@creator/video/..."
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  disabled={isPending}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Hỗ trợ TikTok, YouTube, Facebook, Instagram, LinkedIn, X và website thông thường.
                </p>
              </div>

              <div className="rounded-lg border border-border/60 bg-surface-elev px-3 py-2 text-sm">
                <span className="text-muted-foreground">Nền tảng phát hiện: </span>
                <span className="font-semibold text-brand">{detectedLabel}</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="url-title">Tiêu đề (tuỳ chọn)</Label>
                <Input
                  id="url-title"
                  placeholder="Tự động từ URL nếu để trống"
                  value={urlTitle}
                  onChange={(event) => {
                    setUrlTitleTouched(true);
                    setUrlTitle(event.target.value);
                  }}
                  disabled={isPending}
                  maxLength={200}
                />
              </div>

              <div className="rounded-lg border border-brand/20 bg-gradient-brand-soft px-3 py-2 text-xs text-muted-foreground">
                Link sẽ được lưu ngay. Hệ thống chưa trích xuất caption/video — trạng thái{" "}
                <span className="font-semibold text-foreground">manual_required</span>.
              </div>

              {errors.form ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errors.form}
                </div>
              ) : null}

              <DialogFooter className="px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || sourceUrl.trim().length === 0}
                  className="bg-gradient-brand text-white shadow-glow gap-2"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Lưu link
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          <TabsContent value="text">
            <form onSubmit={handleTextSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="content-title">Tiêu đề</Label>
                <Input
                  id="content-title"
                  placeholder="Ví dụ: Hook skincare 12 triệu"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={isPending}
                  maxLength={200}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content-text">Nội dung (caption / script)</Label>
                <Textarea
                  id="content-text"
                  placeholder="Dán caption hoặc script bạn muốn lưu…"
                  value={rawContent}
                  onChange={(event) => setRawContent(event.target.value)}
                  disabled={isPending}
                  className="min-h-[160px] resize-none"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="content-platform">Nền tảng (tuỳ chọn)</Label>
                  <select
                    id="content-platform"
                    value={platform}
                    onChange={(event) => setPlatform(event.target.value as PlatformType)}
                    disabled={isPending}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {PLATFORM_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content-url-optional">Link nguồn (tuỳ chọn)</Label>
                  <Input
                    id="content-url-optional"
                    type="url"
                    placeholder="https://..."
                    value={optionalSourceUrl}
                    onChange={(event) => setOptionalSourceUrl(event.target.value)}
                    disabled={isPending}
                  />
                </div>
              </div>

              {errors.form ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {errors.form}
                </div>
              ) : null}

              <DialogFooter className="px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Huỷ
                </Button>
                <Button
                  type="submit"
                  disabled={isPending || title.trim().length === 0 || rawContent.trim().length === 0}
                  className="bg-gradient-brand text-white shadow-glow gap-2"
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Lưu vào bảng
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
