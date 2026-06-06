/**
 * Thin Composio REST client — no SDK dependency.
 *
 * Prerequisites:
 * 1. Create a Composio account → https://composio.dev
 * 2. Connect your Facebook Page (OAuth) in Composio dashboard
 * 3. Copy the Connected Account ID and API key into .env.local
 *
 * Action names are version-dependent. Verify the exact name in:
 *   https://app.composio.dev/apps/facebook
 */

const COMPOSIO_API_KEY = process.env.COMPOSIO_API_KEY ?? "";
const COMPOSIO_BASE_URL =
  process.env.COMPOSIO_BASE_URL ?? "https://backend.composio.dev/api/v3.1";

export interface ComposioExecuteOptions {
  actionName: string;
  params: Record<string, unknown>;
  connectedAccountId: string;
}

export async function composioExecute(options: ComposioExecuteOptions) {
  if (!COMPOSIO_API_KEY) {
    throw new Error("Missing COMPOSIO_API_KEY");
  }

  const res = await fetch(`${COMPOSIO_BASE_URL}/actions/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": COMPOSIO_API_KEY,
    },
    body: JSON.stringify({
      actionName: options.actionName,
      params: options.params,
      connectedAccountId: options.connectedAccountId,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Composio HTTP ${res.status}: ${body.slice(0, 500)}`);
  }

  return res.json() as Promise<{ success: boolean; data?: unknown; error?: string }>;
}
