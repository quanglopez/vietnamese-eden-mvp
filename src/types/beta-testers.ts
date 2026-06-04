import type { Database } from "@/types/database";

export type BetaPersona = Database["public"]["Enums"]["beta_persona"];
export type BetaInviteStatus = Database["public"]["Enums"]["beta_invite_status"];
export type BetaSignupStatus = Database["public"]["Enums"]["beta_signup_status"];
export type BetaCoreFlowStatus = Database["public"]["Enums"]["beta_core_flow_status"];
export type BetaFeedbackStatus = Database["public"]["Enums"]["beta_feedback_status"];

export type BetaTesterRow = Database["public"]["Tables"]["beta_testers"]["Row"];

export type ComputedCoreFlowStatus = BetaCoreFlowStatus;

export type BetaTesterWithHint = BetaTesterRow & {
  analyticsCoreFlowHint: ComputedCoreFlowStatus | null;
};

export const BETA_PERSONA_OPTIONS: { value: BetaPersona; label: string }[] = [
  { value: "creator", label: "Creator" },
  { value: "agency", label: "Agency" },
  { value: "beauty_lifestyle", label: "Beauty / Lifestyle" },
  { value: "educator_coach", label: "Educator / Coach" },
  { value: "other", label: "Khác" },
];

export const BETA_INVITE_STATUS_OPTIONS: { value: BetaInviteStatus; label: string }[] = [
  { value: "pending", label: "Chờ mời" },
  { value: "invited", label: "Đã mời" },
  { value: "accepted", label: "Đã chấp nhận" },
  { value: "declined", label: "Từ chối" },
  { value: "expired", label: "Hết hạn" },
];

export const BETA_SIGNUP_STATUS_OPTIONS: { value: BetaSignupStatus; label: string }[] = [
  { value: "not_signed_up", label: "Chưa đăng ký" },
  { value: "signed_up", label: "Đã đăng ký" },
  { value: "onboarded", label: "Đã onboard" },
];

export const BETA_CORE_FLOW_STATUS_OPTIONS: { value: BetaCoreFlowStatus; label: string }[] = [
  { value: "not_started", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang làm" },
  { value: "partial", label: "Làm dở" },
  { value: "completed", label: "Hoàn thành" },
];

export const BETA_FEEDBACK_STATUS_OPTIONS: { value: BetaFeedbackStatus; label: string }[] = [
  { value: "not_requested", label: "Chưa yêu cầu" },
  { value: "requested", label: "Đã yêu cầu" },
  { value: "received", label: "Đã nhận" },
  { value: "n/a", label: "Không áp dụng" },
];

const CORE_FLOW_EVENT_TYPES = [
  "board_create",
  "content_add",
  "breakdown_run",
  "remix_run",
] as const;

export function computeCoreFlowFromEventTypes(
  eventTypes: Iterable<string>,
): ComputedCoreFlowStatus {
  const seen = new Set<string>();
  for (const type of eventTypes) {
    if ((CORE_FLOW_EVENT_TYPES as readonly string[]).includes(type)) {
      seen.add(type);
    }
  }
  const count = seen.size;
  if (count === 0) return "not_started";
  if (count === CORE_FLOW_EVENT_TYPES.length) return "completed";
  return "in_progress";
}

export function labelForPersona(value: BetaPersona): string {
  return BETA_PERSONA_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForInviteStatus(value: BetaInviteStatus): string {
  return BETA_INVITE_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForSignupStatus(value: BetaSignupStatus): string {
  return BETA_SIGNUP_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForCoreFlowStatus(value: BetaCoreFlowStatus): string {
  return BETA_CORE_FLOW_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelForFeedbackStatus(value: BetaFeedbackStatus): string {
  return BETA_FEEDBACK_STATUS_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
