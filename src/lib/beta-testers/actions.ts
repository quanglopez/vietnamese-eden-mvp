"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type {
  BetaCoreFlowStatus,
  BetaFeedbackStatus,
  BetaInviteStatus,
  BetaPersona,
  BetaSignupStatus,
} from "@/types/beta-testers";
import type { Database } from "@/types/database";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function mapDbError(message: string): string {
  if (message.includes("beta_testers_workspace_email_unique")) {
    return "Email này đã có trong danh sách tester của workspace.";
  }
  if (message.includes("beta_testers_email_format")) {
    return "Email không hợp lệ.";
  }
  return message;
}

export type CreateBetaTesterInput = {
  workspaceId: string;
  email: string;
  fullName?: string;
  persona: BetaPersona;
  inviteStatus?: BetaInviteStatus;
  signupStatus?: BetaSignupStatus;
  coreFlowStatus?: BetaCoreFlowStatus;
  feedbackStatus?: BetaFeedbackStatus;
  userId?: string | null;
  notes?: string;
};

export type UpdateBetaTesterInput = {
  testerId: string;
  workspaceId: string;
  fullName?: string | null;
  persona?: BetaPersona;
  inviteStatus?: BetaInviteStatus;
  signupStatus?: BetaSignupStatus;
  coreFlowStatus?: BetaCoreFlowStatus;
  feedbackStatus?: BetaFeedbackStatus;
  userId?: string | null;
  notes?: string | null;
};

export async function createBetaTesterAction(
  input: CreateBetaTesterInput,
): Promise<ActionResult<{ id: string }>> {
  const email = normalizeEmail(input.email);
  if (!EMAIL_PATTERN.test(email)) {
    return { success: false, error: "Vui lòng nhập email hợp lệ." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const fullName = input.fullName?.trim() || null;

  const { data, error } = await supabase
    .from("beta_testers")
    .insert({
      workspace_id: input.workspaceId,
      email,
      full_name: fullName,
      persona: input.persona,
      invite_status: input.inviteStatus ?? "pending",
      signup_status: input.signupStatus ?? "not_signed_up",
      core_flow_status: input.coreFlowStatus ?? "not_started",
      feedback_status: input.feedbackStatus ?? "not_requested",
      user_id: input.userId ?? null,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/beta-testers");
  return { success: true, data: { id: data.id } };
}

export async function updateBetaTesterAction(
  input: UpdateBetaTesterInput,
): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const patch: Database["public"]["Tables"]["beta_testers"]["Update"] = {};
  if (input.fullName !== undefined) {
    patch.full_name = input.fullName?.trim() || null;
  }
  if (input.persona !== undefined) patch.persona = input.persona;
  if (input.inviteStatus !== undefined) patch.invite_status = input.inviteStatus;
  if (input.signupStatus !== undefined) patch.signup_status = input.signupStatus;
  if (input.coreFlowStatus !== undefined) patch.core_flow_status = input.coreFlowStatus;
  if (input.feedbackStatus !== undefined) patch.feedback_status = input.feedbackStatus;
  if (input.userId !== undefined) patch.user_id = input.userId;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;

  if (Object.keys(patch).length === 0) {
    return { success: false, error: "Không có thay đổi để lưu." };
  }

  const { data, error } = await supabase
    .from("beta_testers")
    .update(patch)
    .eq("id", input.testerId)
    .eq("workspace_id", input.workspaceId)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/beta-testers");
  return { success: true, data: { id: data.id } };
}

export async function deleteBetaTesterAction(input: {
  testerId: string;
  workspaceId: string;
}): Promise<ActionResult<{ id: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập." };
  }

  const { data, error } = await supabase
    .from("beta_testers")
    .delete()
    .eq("id", input.testerId)
    .eq("workspace_id", input.workspaceId)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: mapDbError(error.message) };
  }

  revalidatePath("/admin/beta-testers");
  return { success: true, data: { id: data.id } };
}
