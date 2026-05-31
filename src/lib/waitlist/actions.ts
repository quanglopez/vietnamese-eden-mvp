"use server";

import { createClient } from "@/lib/supabase/server";
import { waitlistSchema } from "@/lib/validations/waitlist";

export type WaitlistActionResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: Record<string, string> };

export async function joinBetaWaitlistAction(
  input: unknown,
): Promise<WaitlistActionResult> {
  const parsed = waitlistSchema.safeParse(input);

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0]?.toString();
      if (key && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return {
      success: false,
      error: "Vui lòng kiểm tra lại thông tin.",
      fieldErrors,
    };
  }

  const { fullName, email, useCase } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  let supabase;
  try {
    supabase = createClient();
  } catch {
    return {
      success: false,
      error: "Hệ thống chưa cấu hình Supabase. Liên hệ admin.",
    };
  }

  const { error } = await supabase.from("beta_waitlist").insert({
    full_name: fullName,
    email: normalizedEmail,
    use_case: useCase,
    source: "landing",
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Email này đã đăng ký waitlist rồi.",
        fieldErrors: { email: "Email đã tồn tại." },
      };
    }

    if (error.code === "42P01" || error.message.includes("beta_waitlist")) {
      return {
        success: false,
        error:
          "Bảng waitlist chưa được migrate. Chạy: supabase db reset hoặc apply migration ALE-77.",
      };
    }

    return {
      success: false,
      error: "Không thể ghi waitlist. Thử lại sau.",
    };
  }

  return { success: true };
}
