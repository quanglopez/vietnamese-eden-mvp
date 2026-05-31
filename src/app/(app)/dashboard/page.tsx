import type { Metadata } from "next";

import { DashboardView } from "@/components/custom/app/dashboard-view";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Tổng quan · Vietnamese Eden",
};

function getGreetingName(fullName: string | null): string {
  if (fullName) {
    const first = fullName.trim().split(/\s+/)[0];
    return first ?? "bạn";
  }
  return "bạn";
}

function getUserDisplayName(metadata: Record<string, unknown>): string | null {
  if (typeof metadata.full_name === "string") {
    return metadata.full_name;
  }
  if (typeof metadata.name === "string") {
    return metadata.name;
  }
  return null;
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const fullName = getUserDisplayName(metadata);
  const greetingName = getGreetingName(fullName);

  return (
    <DashboardView
      title={`Chào buổi sáng, ${greetingName} 👋`}
      subtitle="Hôm nay có 12 video viral mới trong niche của bạn."
    />
  );
}
