import { type NextRequest, NextResponse } from "next/server";

import { handleCallback } from "@/lib/composio/oauth";
import { isIntegrationProvider } from "@/lib/composio/providers";
import { createClient } from "@/lib/supabase/server";

function integrationsRedirect(params: Record<string, string>): NextResponse {
  const url = new URL("/settings/integrations", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

/**
 * GET /api/composio/callback?connection_id=xxx&userId=xxx&provider=xxx&state=xxx
 * Composio OAuth redirect — lưu mapping và chuyển về trang tích hợp.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const connectionId =
    searchParams.get("connection_id") ??
    searchParams.get("connectedAccountId") ??
    searchParams.get("connected_account_id");
  const userId = searchParams.get("userId");
  const provider = searchParams.get("provider");
  const state = searchParams.get("state");

  if (!connectionId || !userId || !provider || !state) {
    return integrationsRedirect({ error: "missing_params" });
  }

  if (!isIntegrationProvider(provider)) {
    return integrationsRedirect({ error: "invalid_provider" });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return integrationsRedirect({ error: "unauthorized" });
  }

  try {
    await handleCallback({
      connectionId,
      userId,
      provider,
      state,
      supabase,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "callback_failed";
    console.error("[composio/callback]", message);
    return integrationsRedirect({ error: "callback_failed" });
  }

  return integrationsRedirect({ success: "true", provider });
}
