"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Link2, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { initiateIntegrationOAuthAction } from "@/lib/composio/oauth-actions";
import {
  INTEGRATION_PROVIDER_DESCRIPTIONS,
  INTEGRATION_PROVIDER_LABELS,
  INTEGRATION_PROVIDERS,
  type IntegrationProvider,
} from "@/lib/composio/providers";

type IntegrationConnection = {
  provider: IntegrationProvider;
  status: "initiated" | "active" | "failed" | "revoked";
  connectedAccountId: string;
  updatedAt: string;
};

type IntegrationsConnectPanelProps = {
  connections: IntegrationConnection[];
};

function getStatusLabel(
  status: IntegrationConnection["status"] | "disconnected",
): string {
  switch (status) {
    case "active":
      return "Đã kết nối";
    case "initiated":
      return "Đang chờ xác thực";
    case "failed":
      return "Kết nối thất bại";
    case "revoked":
      return "Đã ngắt kết nối";
    case "disconnected":
      return "Chưa kết nối";
    default:
      return "Chưa kết nối";
  }
}

function getStatusVariant(
  status: IntegrationConnection["status"] | "disconnected",
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "active") {
    return "default";
  }
  if (status === "failed" || status === "revoked") {
    return "destructive";
  }
  if (status === "initiated") {
    return "secondary";
  }
  return "outline";
}

export function IntegrationsConnectPanel({ connections }: IntegrationsConnectPanelProps) {
  const router = useRouter();
  const [pendingProvider, setPendingProvider] = useState<IntegrationProvider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const connectionByProvider = new Map(
    connections.map((connection) => [connection.provider, connection]),
  );

  const handleConnect = useCallback((provider: IntegrationProvider) => {
    setErrorMessage(null);
    setPendingProvider(provider);

    startTransition(async () => {
      const result = await initiateIntegrationOAuthAction(provider);
      if (!result.success) {
        setErrorMessage(result.error);
        setPendingProvider(null);
        return;
      }

      const popup = window.open(
        result.data.redirectUrl,
        "eden-composio-oauth",
        "width=520,height=720,noopener,noreferrer",
      );

      if (!popup) {
        setErrorMessage("Trình duyệt đã chặn cửa sổ popup. Hãy cho phép popup và thử lại.");
        setPendingProvider(null);
        return;
      }

      popup.focus();
      setPendingProvider(null);
    });
  }, []);

  useEffect(() => {
    const refreshOnFocus = () => {
      router.refresh();
    };
    window.addEventListener("focus", refreshOnFocus);
    return () => window.removeEventListener("focus", refreshOnFocus);
  }, [router]);

  return (
    <div className="space-y-6">
      {errorMessage ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {INTEGRATION_PROVIDERS.map((provider) => {
          const connection = connectionByProvider.get(provider);
          const status = connection?.status ?? "disconnected";
          const isConnecting = isPending && pendingProvider === provider;

          return (
            <Card key={provider} className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{INTEGRATION_PROVIDER_LABELS[provider]}</CardTitle>
                    <CardDescription className="mt-1">
                      {INTEGRATION_PROVIDER_DESCRIPTIONS[provider]}
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(status)}>{getStatusLabel(status)}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {connection?.status === "active" ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Sẵn sàng sử dụng với Eden.
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Kết nối tài khoản {INTEGRATION_PROVIDER_LABELS[provider]} qua OAuth an toàn
                    (token lưu tại Composio).
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button
                  type="button"
                  variant={connection?.status === "active" ? "outline" : "default"}
                  className="w-full gap-2"
                  disabled={isConnecting}
                  onClick={() => handleConnect(provider)}
                >
                  {isConnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Link2 className="h-4 w-4" />
                  )}
                  {connection?.status === "active" ? "Kết nối lại" : "Kết nối"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
