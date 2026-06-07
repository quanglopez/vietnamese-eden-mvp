"use client";

import { useState, useTransition, useRef } from "react";
import { CalendarPlus, Loader2, Paperclip, X } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { addToCalendarAction } from "@/lib/calendar/actions";
import {
  CALENDAR_CHANNEL_OPTIONS,
  CALENDAR_STATUS_OPTIONS,
} from "@/lib/calendar/constants";
import { createClient } from "@/lib/supabase/client";
import type { CalendarChannel, CalendarStatus } from "@/types/calendar";
import type { GeneratedOutputView } from "@/types/remix";

const CHANNEL_ICONS: Record<string, string> = {
  facebook: "📘",
  tiktok: "🎵",
  instagram: "📸",
  youtube_shorts: "🎬",
  linkedin: "💼",
  email: "📧",
  blog: "📝",
  other: "🔗",
};

function defaultDateString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

type AddToCalendarDialogProps = {
  output: GeneratedOutputView | null;
  contentItemId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

export function AddToCalendarDialog({
  output,
  contentItemId,
  open,
  onOpenChange,
  onSuccess,
}: AddToCalendarDialogProps) {
  const [title, setTitle] = useState("");
  const [scheduledDate, setScheduledDate] = useState(defaultDateString);
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [channel, setChannel] = useState<CalendarChannel>("facebook");
  const [status, setStatus] = useState<CalendarStatus>("scheduled");
  const [publishNow, setPublishNow] = useState(false);
  const [notes, setNotes] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openWithOutput = (next: GeneratedOutputView | null, isOpen: boolean) => {
    if (isOpen && next) {
      setTitle(next.title);
      setScheduledDate(defaultDateString());
      setError(null);
    }
    if (!isOpen) {
      // Reset media state when closing
      setMediaFile(null);
      setMediaPreview(null);
    }
    onOpenChange(isOpen);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setMediaFile(file);

    // Generate preview URL
    const url = URL.createObjectURL(file);
    setMediaPreview(url);
  };

  const handleRemoveFile = () => {
    setMediaFile(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadMedia = async (file: File): Promise<string> => {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("calendar-media")
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw new Error(`Không thể tải lên file: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from("calendar-media").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!output) return;

    setError(null);
    startTransition(async () => {
      let mediaUrl: string | undefined;

      if (mediaFile) {
        setIsUploading(true);
        try {
          mediaUrl = await uploadMedia(mediaFile);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Lỗi khi tải lên file.");
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      const result = await addToCalendarAction({
        generatedOutputId: output.id,
        contentItemId,
        title,
        scheduledDate: publishNow ? new Date().toISOString().slice(0, 10) : scheduledDate,
        scheduledTime: publishNow ? new Date().toTimeString().slice(0, 5) : scheduledTime,
        channel,
        status,
        notes: notes || undefined,
        publishNow,
        mediaUrl,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onSuccess?.();
    });
  };

  const isBusy = isPending || isUploading;
  const isVideo = mediaFile?.type.startsWith("video/");

  return (
    <Dialog open={open} onOpenChange={(v) => openWithOutput(output, v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-brand" />
            Đưa vào lịch
          </DialogTitle>
          <DialogDescription>
            Lên lịch đăng nội dung remix. Nội dung sẽ được tự động đăng lên nền tảng đã chọn vào thời gian lên lịch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cal-title">Tiêu đề</Label>
            <Input
              id="cal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isBusy}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cal-date">Ngày</Label>
              <Input
                id="cal-date"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                disabled={isBusy}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cal-time">Giờ (tuỳ chọn)</Label>
              <Input
                id="cal-time"
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                disabled={isBusy}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cal-channel">Kênh</Label>
              <Select
                value={channel}
                onValueChange={(v) => setChannel(v as CalendarChannel)}
                disabled={isBusy}
              >
                <SelectTrigger id="cal-channel">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_CHANNEL_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {CHANNEL_ICONS[opt.value]} {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cal-status">Trạng thái</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as CalendarStatus)}
                disabled={isBusy}
              >
                <SelectTrigger id="cal-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CALENDAR_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cal-notes">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="cal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isBusy}
              className="min-h-[72px] resize-none"
              placeholder="VD: Đăng kèm ảnh cover…"
            />
          </div>

          {/* Media upload */}
          <div className="space-y-2">
            <Label htmlFor="cal-media">Ảnh / Video (tuỳ chọn)</Label>
            {mediaFile ? (
              <div className="relative rounded-lg border bg-muted/40 p-2">
                {isVideo ? (
                  <video
                    src={mediaPreview ?? undefined}
                    className="max-h-40 w-full rounded object-contain"
                    controls
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaPreview ?? undefined}
                    alt="Preview"
                    className="max-h-40 w-full rounded object-contain"
                  />
                )}
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={isBusy}
                  className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-muted-foreground hover:text-foreground"
                  aria-label="Xoá file"
                >
                  <X className="h-4 w-4" />
                </button>
                <p className="mt-1 truncate text-xs text-muted-foreground">{mediaFile.name}</p>
              </div>
            ) : (
              <label
                htmlFor="cal-media"
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm text-muted-foreground hover:border-foreground/40 hover:text-foreground"
              >
                <Paperclip className="h-4 w-4 shrink-0" />
                <span>Chọn ảnh hoặc video…</span>
                <input
                  ref={fileInputRef}
                  id="cal-media"
                  type="file"
                  accept="image/*,video/*"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={isBusy}
                />
              </label>
            )}
          </div>

          {error ? (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            💡 Nội dung sẽ được tự động đăng lên nền tảng đã chọn. Đảm bảo bạn đã liên kết tài khoản OAuth trong Settings.
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publishNow}
              onChange={(e) => setPublishNow(e.target.checked)}
              disabled={isBusy}
              className="h-4 w-4 rounded border-input"
            />
            Đăng ngay (scheduled_at = hiện tại)
          </label>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isBusy || !output} className="gap-2">
              {isBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isUploading ? "Đang tải lên…" : "Đang lưu…"}
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4" />
                  Thêm vào lịch
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
