export const INTEGRATION_PROVIDERS = [
  "facebook",
  "tiktok",
  "linkedin",
  "notion",
  "googlesheets",
  "telegram",
  "slack",
] as const;

export type IntegrationProvider = (typeof INTEGRATION_PROVIDERS)[number];

export const COMPOSIO_APP_NAME_BY_PROVIDER: Record<IntegrationProvider, string> = {
  facebook: "FACEBOOK",
  tiktok: "TIKTOK",
  linkedin: "LINKEDIN",
  notion: "NOTION",
  googlesheets: "GOOGLESHEETS",
  telegram: "TELEGRAM",
  slack: "SLACK",
};

const COMPOSIO_APP_TO_PROVIDER = Object.fromEntries(
  Object.entries(COMPOSIO_APP_NAME_BY_PROVIDER).map(([provider, appName]) => [
    appName.toUpperCase(),
    provider,
  ]),
) as Record<string, IntegrationProvider>;

export function providerFromComposioAppName(appName: string): IntegrationProvider | null {
  const normalized = appName.trim().toUpperCase();
  return COMPOSIO_APP_TO_PROVIDER[normalized] ?? null;
}

export function isIntegrationProvider(value: string): value is IntegrationProvider {
  return (INTEGRATION_PROVIDERS as readonly string[]).includes(value);
}

export const INTEGRATION_PROVIDER_LABELS: Record<IntegrationProvider, string> = {
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  notion: "Notion",
  googlesheets: "Google Sheets",
  telegram: "Telegram",
  slack: "Slack",
};

export const INTEGRATION_PROVIDER_DESCRIPTIONS: Record<IntegrationProvider, string> = {
  facebook: "Đăng bài và quản lý trang Facebook.",
  tiktok: "Đăng video lên TikTok.",
  linkedin: "Chia sẻ nội dung lên LinkedIn.",
  notion: "Xuất breakdown và lịch nội dung sang Notion.",
  googlesheets: "Xuất dữ liệu nội dung sang Google Sheets.",
  telegram: "Nhận thông báo qua Telegram.",
  slack: "Nhận thông báo qua Slack.",
};
