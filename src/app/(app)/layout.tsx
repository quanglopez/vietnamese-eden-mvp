import { redirect } from "next/navigation";

import { AppSessionProvider } from "@/components/custom/app/app-session-provider";
import { createClient } from "@/lib/supabase/server";

function getUserDisplayName(metadata: Record<string, unknown>): string | null {
  if (typeof metadata.full_name === "string") {
    return metadata.full_name;
  }
  if (typeof metadata.name === "string") {
    return metadata.name;
  }
  return null;
}

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata as Record<string, unknown>;

  return (
    <AppSessionProvider
      user={{
        email: user.email,
        fullName: getUserDisplayName(metadata),
      }}
    >
      {children}
    </AppSessionProvider>
  );
}
