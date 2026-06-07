import type { CalendarChannel, CalendarStatus } from "@/types/calendar";
import type { PlatformType } from "@/types/content";

export const CALENDAR_AUTO_POST_NOTICE =
  "Nội dung sẽ được tự động đăng lên nền tảng đã chọn vào thời gian lên lịch. Đảm bảo bạn đã liên kết tài khoản OAuth.";

export const CALENDAR_CHANNEL_OPTIONS: { value: CalendarChannel; label: string }[] = [
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
  { value: "youtube_shorts", label: "YouTube Shorts" },
  { value: "email", label: "Email" },
  { value: "blog", label: "Blog" },
  { value: "other", label: "Khác" },
];

export const CALENDAR_STATUS_OPTIONS: { value: CalendarStatus; label: string }[] = [
  { value: "scheduled", label: "Đã lên lịch" },
  { value: "published", label: "Đã đăng" },
  { value: "skipped", label: "Bỏ qua" },
];

export function getCalendarChannelLabel(channel: CalendarChannel): string {
  return CALENDAR_CHANNEL_OPTIONS.find((o) => o.value === channel)?.label ?? channel;
}

export function getCalendarStatusLabel(status: CalendarStatus): string {
  return CALENDAR_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function channelToPlatform(channel: CalendarChannel): PlatformType {
  switch (channel) {
    case "facebook":
      return "facebook";
    case "instagram":
      return "instagram";
    case "tiktok":
      return "tiktok";
    case "youtube_shorts":
      return "youtube";
    case "linkedin":
      return "linkedin";
    case "email":
    case "blog":
    case "other":
    default:
      return "other";
  }
}

export function buildScheduledAtIso(date: string, time?: string): string {
  const timePart = time?.trim() || "09:00";
  const local = new Date(`${date}T${timePart}:00`);
  return local.toISOString();
}
