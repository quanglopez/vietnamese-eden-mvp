import type { Metadata } from "next";

import { AppShell } from "@/components/custom/app/app-shell";
import { IntegrationsConnectPanel } from "@/components/custom/integrations/integrations-connect-panel";
import { listUserConnectedAccounts } from "@/lib/composio/oauth";
import {
  INTEGRATION_PROVIDER_LABELS,
  isIntegrationProvider,
} from "@/lib/composio/providers";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tích hợp · Vietnamese Eden",
  description: "Kết nối Facebook, TikTok, Notion, Google Sheets, Slack, Telegram và hơn thế nữa.",
};

type IntegrationsPageProps = {
  searchParams?: {
    success?: string;
    provider?: string;
    error?: string;
  };
};

function getBannerMessage(searchParams: IntegrationsPageProps["searchParams"]): string | null {
  if (!searchParams) {
    return null;
  }

  if (searchParams.success === "true") {
    const provider = searchParams.provider;
    if (provider && isIntegrationProvider(provider)) {
      return `Đã kết nối ${INTEGRATION_PROVIDER_LABELS[provider]} thành công.`;
    }
    return "Kết nối tích hợp thành công.";
  }

  if (searchParams.error === "unauthorized") {
    return "Phiên đăng nhập không hợp lệ. Hãy đăng nhập lại rồi thử kết nối.";
  }
  if (searchParams.error === "callback_failed") {
    return "Không thể hoàn tất OAuth. Vui lòng thử lại.";
  }
  if (searchParams.error) {
    return "Có lỗi khi kết nối tích hợp. Vui lòng thử lại.";
  }

  return null;
}

export default async function IntegrationsSettingsPage({ searchParams }: IntegrationsPageProps) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let connections: Awaited<ReturnType<typeof listUserConnectedAccounts>> = [];
  let fetchError: string | null = null;

  try {
    connections = await listUserConnectedAccounts({
      userId: user.id,
      supabase,
    });
  } catch (error) {
    fetchError = error instanceof Error ? error.message : "Không thể tải trạng thái tích hợp.";
  }

  const bannerMessage = getBannerMessage(searchParams);

  return (
    <AppShell
      title="Tích hợp"
      subtitle="Kết nối tài khoản mạng xã hội và công cụ làm việc — OAuth an toàn qua Composio."
    >
      <div className="mx-auto max-w-6xl space-y-6 px-1 pb-8">
        {bannerMessage ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100">
            {bannerMessage}
          </div>
        ) : null}

        {fetchError ? (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {fetchError}
          </div>
        ) : null}

        <IntegrationsConnectPanel connections={connections} />
      </div>
    </AppShell>
  );
}
