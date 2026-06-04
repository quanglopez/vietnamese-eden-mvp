import type { Database } from "@/types/database";

export type FeedbackSource = Database["public"]["Tables"]["feedback_entries"]["Row"]["source"];
export type FeedbackReporterPersona =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["reporter_persona"];
export type FeedbackCategory =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["category"];
export type FeedbackPriority =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["priority"];
export type FeedbackStatus =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["status"];
export type FeedbackDevice =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["device"];
export type FeedbackReproducible =
  Database["public"]["Tables"]["feedback_entries"]["Row"]["reproducible"];

export type FeedbackEntryRow = Database["public"]["Tables"]["feedback_entries"]["Row"];

export const FEEDBACK_SOURCE_OPTIONS: { value: FeedbackSource; label: string }[] = [
  { value: "google_form", label: "Google Form" },
  { value: "manual_chat", label: "Chat thủ công" },
  { value: "email", label: "Email" },
  { value: "dogfood", label: "Dogfood nội bộ" },
  { value: "other", label: "Khác" },
];

export const FEEDBACK_PERSONA_OPTIONS: { value: NonNullable<FeedbackReporterPersona>; label: string }[] =
  [
    { value: "creator", label: "Creator" },
    { value: "freelancer", label: "Freelancer" },
    { value: "agency", label: "Agency" },
    { value: "educator", label: "Educator" },
    { value: "beauty_lifestyle", label: "Beauty / Lifestyle" },
    { value: "other", label: "Khác" },
  ];

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "bug", label: "Lỗi" },
  { value: "ux", label: "UX" },
  { value: "fr", label: "Tính năng" },
  { value: "ai", label: "AI" },
  { value: "price", label: "Giá" },
  { value: "positive", label: "Tích cực" },
];

export const FEEDBACK_PRIORITY_OPTIONS: { value: NonNullable<FeedbackPriority>; label: string }[] = [
  { value: "p0", label: "P0 — Nghiêm trọng" },
  { value: "p1", label: "P1 — Cao" },
  { value: "p2", label: "P2 — Trung bình" },
  { value: "p3", label: "P3 — Thấp" },
];

export const FEEDBACK_STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "untriaged", label: "Chưa phân loại" },
  { value: "triaged", label: "Đã phân loại" },
  { value: "actioned", label: "Đã xử lý" },
  { value: "closed", label: "Đã đóng" },
];

export const FEEDBACK_DEVICE_OPTIONS: { value: NonNullable<FeedbackDevice>; label: string }[] = [
  { value: "desktop", label: "Desktop" },
  { value: "mobile", label: "Mobile" },
  { value: "both", label: "Cả hai" },
  { value: "unknown", label: "Không rõ" },
];

export const FEEDBACK_REPRODUCIBLE_OPTIONS: {
  value: NonNullable<FeedbackReproducible>;
  label: string;
}[] = [
  { value: "yes", label: "Có" },
  { value: "no", label: "Không" },
  { value: "not_tried", label: "Chưa thử" },
];

const CATEGORY_SET = new Set(FEEDBACK_CATEGORY_OPTIONS.map((o) => o.value));
const PRIORITY_SET = new Set(FEEDBACK_PRIORITY_OPTIONS.map((o) => o.value));

export function isFeedbackCategory(value: string): value is FeedbackCategory {
  return CATEGORY_SET.has(value as FeedbackCategory);
}

export function isFeedbackPriority(
  value: string,
): value is NonNullable<FeedbackPriority> {
  return PRIORITY_SET.has(value as NonNullable<FeedbackPriority>);
}

export function labelForSource(value: FeedbackSource): string {
  return FEEDBACK_SOURCE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForCategory(value: FeedbackCategory): string {
  return FEEDBACK_CATEGORY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForPriority(value: FeedbackPriority | null): string {
  if (!value) return "—";
  return FEEDBACK_PRIORITY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForStatus(value: FeedbackStatus): string {
  return FEEDBACK_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function truncateSummary(text: string, max = 80): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}
