import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

import {
  COMPOSIO_APP_NAME_BY_PROVIDER,
  type IntegrationProvider,
  providerFromComposioAppName,
} from "./providers";

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? "";
const COMPOSIO_BASE_URL =
  process.env.COMPOSIO_BASE_URL?.replace(/\/api\/v1\/?$/, "") ??
  "https://backend.composio.dev";

const COMPOSIO_V3_BASE = `${COMPOSIO_BASE_URL}/api/v3.1`;

type ConnectedAccountStatus = Database["public"]["Tables"]["user_connected_accounts"]["Row"]["status"];

type ComposioConnectedAccountResponse = {
  id?: string;
  appName?: string;
  entityId?: string;
  status?: string;
  connectionStatus?: string;
};

function getAppBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function getOAuthStateSecret(): string {
  return (
    process.env.COMPOSIO_OAUTH_STATE_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "dev-composio-oauth-state-secret"
  );
}

function mapComposioStatus(value: string | undefined): ConnectedAccountStatus {
  const normalized = value?.toLowerCase() ?? "";
  if (normalized === "active") {
    return "active";
  }
  if (normalized === "failed") {
    return "failed";
  }
  if (normalized === "revoked" || normalized === "expired") {
    return "revoked";
  }
  return "initiated";
}

export function createOAuthState(userId: string, provider: IntegrationProvider): string {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${userId}:${provider}:${nonce}`;
  const signature = createHmac("sha256", getOAuthStateSecret()).update(payload).digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

export function verifyOAuthState(state: string): { userId: string; provider: IntegrationProvider } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 4) {
      return null;
    }

    const userId = parts[0];
    const provider = parts[1];
    const nonce = parts[2];
    const signature = parts[3];

    if (!userId || !provider || !nonce || !signature) {
      return null;
    }

    if (!(provider in COMPOSIO_APP_NAME_BY_PROVIDER)) {
      return null;
    }

    const integrationProvider = provider as IntegrationProvider;
    const payload = `${userId}:${integrationProvider}:${nonce}`;
    const expected = createHmac("sha256", getOAuthStateSecret()).update(payload).digest("hex");

    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expected, "hex");
    if (sigBuffer.length !== expectedBuffer.length || !timingSafeEqual(sigBuffer, expectedBuffer)) {
      return null;
    }

    return { userId, provider: integrationProvider };
  } catch {
    return null;
  }
}

function buildCallbackRedirectUri(userId: string, provider: IntegrationProvider): string {
  const state = createOAuthState(userId, provider);
  const callbackUrl = new URL("/api/composio/callback", getAppBaseUrl());
  callbackUrl.searchParams.set("userId", userId);
  callbackUrl.searchParams.set("provider", provider);
  callbackUrl.searchParams.set("state", state);
  return callbackUrl.toString();
}

async function fetchComposioConnectedAccount(
  connectionId: string,
): Promise<ComposioConnectedAccountResponse> {
  if (!COMPOSIO_API_KEY) {
    throw new Error("Thiếu COMPOSIO_API_KEY.");
  }

  const res = await fetch(`${COMPOSIO_V3_BASE}/connectedAccounts/${connectionId}`, {
    headers: { "x-api-key": COMPOSIO_API_KEY },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Composio connected account ${res.status}: ${text.slice(0, 200)}`);
  }

  return (await res.json()) as ComposioConnectedAccountResponse;
}

export async function initiateOAuth(params: {
  appName: IntegrationProvider;
  userId: string;
}): Promise<{ redirectUrl: string; connectedAccountId: string }> {
  if (!COMPOSIO_API_KEY) {
    throw new Error("Thiếu COMPOSIO_API_KEY.");
  }

  const composioAppName = COMPOSIO_APP_NAME_BY_PROVIDER[params.appName];
  const redirectUri = buildCallbackRedirectUri(params.userId, params.appName);

  const res = await fetch(`${COMPOSIO_V3_BASE}/connectedAccounts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPOSIO_API_KEY,
    },
    body: JSON.stringify({
      appName: composioAppName,
      entityId: params.userId,
      authMode: "OAUTH2",
      redirectUri,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Không thể khởi tạo OAuth Composio (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    connectedAccountId?: string;
    redirectUrl?: string;
  };

  if (!data.connectedAccountId || !data.redirectUrl) {
    throw new Error("Phản hồi Composio thiếu redirectUrl hoặc connectedAccountId.");
  }

  return {
    redirectUrl: data.redirectUrl,
    connectedAccountId: data.connectedAccountId,
  };
}

export async function handleCallback(params: {
  connectionId: string;
  userId: string;
  provider: IntegrationProvider;
  state: string;
  supabase: SupabaseClient<Database>;
}): Promise<void> {
  const verified = verifyOAuthState(params.state);
  if (!verified) {
    throw new Error("State OAuth không hợp lệ.");
  }
  if (verified.userId !== params.userId || verified.provider !== params.provider) {
    throw new Error("State OAuth không khớp với người dùng hoặc nhà cung cấp.");
  }

  const account = await fetchComposioConnectedAccount(params.connectionId);
  const composioAccountId = account.id ?? params.connectionId;

  if (account.entityId && account.entityId !== params.userId) {
    throw new Error("Tài khoản Composio không thuộc về người dùng này.");
  }

  const mappedProvider = account.appName
    ? providerFromComposioAppName(account.appName)
    : params.provider;

  if (!mappedProvider || mappedProvider !== params.provider) {
    throw new Error("Nhà cung cấp OAuth không khớp.");
  }

  const status = mapComposioStatus(account.status ?? account.connectionStatus);

  const { error } = await params.supabase.from("user_connected_accounts").upsert(
    {
      user_id: params.userId,
      provider: params.provider,
      connected_account_id: composioAccountId,
      status,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,provider" },
  );

  if (error) {
    throw new Error(`Không thể lưu kết nối: ${error.message}`);
  }
}

export async function getConnectedAccount(params: {
  userId: string;
  provider: IntegrationProvider;
  supabase: SupabaseClient<Database>;
}): Promise<string | null> {
  const { data, error } = await params.supabase
    .from("user_connected_accounts")
    .select("connected_account_id, status")
    .eq("user_id", params.userId)
    .eq("provider", params.provider)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new Error(`Không thể đọc tài khoản đã kết nối: ${error.message}`);
  }

  return data?.connected_account_id ?? null;
}

export async function listUserConnectedAccounts(params: {
  userId: string;
  supabase: SupabaseClient<Database>;
}): Promise<
  Array<{
    provider: IntegrationProvider;
    status: ConnectedAccountStatus;
    connectedAccountId: string;
    updatedAt: string;
  }>
> {
  const { data, error } = await params.supabase
    .from("user_connected_accounts")
    .select("provider, status, connected_account_id, updated_at")
    .eq("user_id", params.userId)
    .order("provider");

  if (error) {
    throw new Error(`Không thể tải danh sách tích hợp: ${error.message}`);
  }

  return (data ?? []).flatMap((row) => {
    if (!(row.provider in COMPOSIO_APP_NAME_BY_PROVIDER)) {
      return [];
    }
    return [
      {
        provider: row.provider as IntegrationProvider,
        status: row.status,
        connectedAccountId: row.connected_account_id,
        updatedAt: row.updated_at,
      },
    ];
  });
}
