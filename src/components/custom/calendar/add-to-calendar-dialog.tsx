"use client";

import { useState, useTransition } from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

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
import { addToCalendarAction } from "@/lib/calendar/actions";
import {
  CALENDAR_CHANNEL_OPTIONS,
  CALENDAR_STATUS_OPTIONS,
} from "@/lib/calendar/constants";
import type { CalendarChannel, CalendarStatus } from "@/types/calendar";
import type { GeneratedOutputView } from "@/types/remix";

const selectClassName =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

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
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openWithOutput = (next: GeneratedOutputView | null, isOpen: boolean) => {
    if (isOpen && next) {
      setTitle(next.title);
      setScheduledDate(defaultDateString());
      setError(null);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!output) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await addToCalendarAction({
        generatedOutputId: output.id,
        contentItemId,
        title,
        scheduledDate,
        scheduledTime,
        channel,
        status,
        notes: notes || undefined,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      onOpenChange(false);
      onSuccess?.();
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => openWithOutput(output, v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-brand" />
            Đưa vào lịch
          </DialogTitle>
          <DialogDescription>
            Lên lịch đăng nội dung remix. Calendar là công cụ nhắc lịch — bạn vẫn phải tự đăng
            thủ công trên Facebook, TikTok, LinkedIn, v.v.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cal-title">Tiêu đề</Label>
            <Input
              id="cal-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isPending}
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
                disabled={isPending}
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
                disabled={isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cal-channel">Kênh</Label>
              <select
                id="cal-channel"
                value={channel}
                onChange={(e) => setChannel(e.target.value as CalendarChannel)}
                disabled={isPending}
                className={selectClassName}
              >
                {CALENDAR_CHANNEL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cal-status">Trạng thái</Label>
              <select
                id="cal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CalendarStatus)}
                disabled={isPending}
                className={selectClassName}
              >
                {CALENDAR_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cal-notes">Ghi chú (tuỳ chọn)</Label>
            <Textarea
              id="cal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isPending}
              className="min-h-[72px] resize-none"
              placeholder="VD: Đăng kèm ảnh cover…"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive bg-destructive/5 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            💡 Sau khi lên lịch, bạn sẽ nhận nhắc nhở (hoặc tự kiểm tra) để copy-paste nội dung và
            đăng thủ công.
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Huỷ
            </Button>
            <Button type="submit" disabled={isPending || !output} className="gap-2">
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu…
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
