import { type NextRequest, NextResponse } from "next/server";

import { initiateOAuth, listUserConnectedAccounts } from "@/lib/composio/oauth";
import {
  COMPOSIO_APP_NAME_BY_PROVIDER,
  isIntegrationProvider,
  type IntegrationProvider,
} from "@/lib/composio/providers";
import { createClient } from "@/lib/supabase/server";

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? "";

// =============================================================================
// GET /api/composio?intent=list|initiate
// =============================================================================
export async function GET(req: NextRequest) {
  if (!COMPOSIO_API_KEY) {
    return NextResponse.json({ error: "Missing COMPOSIO_API_KEY" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const intent = searchParams.get("intent");

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (intent === "list") {
    try {
      const accounts = await listUserConnectedAccounts({
        userId: user.id,
        supabase,
      });
      return NextResponse.json({ accounts });
    } catch (error) {
      const message = error instanceof Error ? error.message : "list_failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (intent === "initiate") {
    const providerParam = searchParams.get("app") ?? searchParams.get("provider");
    if (!providerParam) {
      return NextResponse.json({ error: "Missing provider" }, { status: 400 });
    }

    const provider = normalizeProviderParam(providerParam);
    if (!provider) {
      return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
    }

    try {
      const result = await initiateOAuth({
        appName: provider,
        userId: user.id,
      });
      return NextResponse.json(result);
    } catch (error) {
      const message = error instanceof Error ? error.message : "initiate_failed";
      return NextResponse.json({ error: message }, { status: 502 });
    }
  }

  return NextResponse.json({ error: "Unknown intent" }, { status: 400 });
}

// =============================================================================
// POST /api/composio — manual store (legacy / webhook fallback)
// =============================================================================
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    connectedAccountId?: string;
    appName?: string;
    userId?: string;
    provider?: string;
  };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const connectedAccountId = body.connectedAccountId;
  const provider = body.provider
    ? normalizeProviderParam(body.provider)
    : body.appName
      ? normalizeProviderParam(body.appName)
      : null;

  if (!connectedAccountId || !provider) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  if (body.userId && body.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase.from("user_connected_accounts").upsert(
    {
      user_id: user.id,
      provider,
      connected_account_id: connectedAccountId,
      status: "active",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stored: true });
}

function normalizeProviderParam(value: string): IntegrationProvider | null {
  const lowered = value.trim().toLowerCase();
  if (isIntegrationProvider(lowered)) {
    return lowered;
  }

  const upper = value.trim().toUpperCase();
  for (const [provider, appName] of Object.entries(COMPOSIO_APP_NAME_BY_PROVIDER)) {
    if (appName === upper && isIntegrationProvider(provider)) {
      return provider;
    }
  }

  return null;
}
