"use server";

import type { ActionResult } from "@/lib/boards/actions";
import { initiateOAuth } from "@/lib/composio/oauth";
import type { IntegrationProvider } from "@/lib/composio/providers";
import { createClient } from "@/lib/supabase/server";

export async function initiateIntegrationOAuthAction(
  provider: IntegrationProvider,
): Promise<ActionResult<{ redirectUrl: string }>> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Bạn cần đăng nhập để kết nối tích hợp." };
  }

  try {
    const { redirectUrl } = await initiateOAuth({
      appName: provider,
      userId: user.id,
    });
    return { success: true, data: { redirectUrl } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Không thể bắt đầu quy trình OAuth.";
    return { success: false, error: message };
  }
}
