"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { addContentTextAction } from "@/lib/content/actions";
import { PLATFORM_OPTIONS } from "@/lib/validations/content";
import type { PlatformType } from "@/types/content";

type AddContentTextModalProps = {
  boardId: string;
  boardName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
};

type FieldErrors = {
  title?: string;
  rawContent?: string;
  sourceUrl?: string;
  form?: string;
};

export function AddContentTextModal({
  boardId,
  boardName,
  open,
  onOpenChange,
  onSuccess,
}: AddContentTextModalProps) {
  const [title, setTitle] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("other");
  const [sourceUrl, setSourceUrl] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isPending, startTransition] = useTransition();

  const resetForm = () => {
    setTitle("");
    setRawContent("");
    setPlatform("other");
    setSourceUrl("");
    setErrors({});
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrors({});

    startTransition(async () => {
      const result = await addContentTextAction({
        boardId,
        title,
        rawContent,
        platform,
        sourceUrl: sourceUrl.trim() || undefined,
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
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Thêm content thủ công</DialogTitle>
            <DialogDescription>
              Lưu caption hoặc script vào bảng{" "}
              <span className="font-semibold text-foreground">{boardName}</span>. AI breakdown sẽ
              có ở sprint tiếp theo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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
              {errors.title ? (
                <p className="text-sm text-destructive">{errors.title}</p>
              ) : null}
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
              {errors.rawContent ? (
                <p className="text-sm text-destructive">{errors.rawContent}</p>
              ) : null}
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
                <Label htmlFor="content-url">Link nguồn (tuỳ chọn)</Label>
                <Input
                  id="content-url"
                  type="url"
                  placeholder="https://..."
                  value={sourceUrl}
                  onChange={(event) => setSourceUrl(event.target.value)}
                  disabled={isPending}
                />
                {errors.sourceUrl ? (
                  <p className="text-sm text-destructive">{errors.sourceUrl}</p>
                ) : null}
              </div>
            </div>

            {errors.form ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {errors.form}
              </div>
            ) : null}
          </div>

          <DialogFooter>
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
      </DialogContent>
    </Dialog>
  );
}
