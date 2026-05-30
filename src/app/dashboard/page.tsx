import { redirect } from "next/navigation";

import { SignOutButton } from "@/components/custom/auth/sign-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const metadata = user.user_metadata as Record<string, unknown>;
  const fullName =
    typeof metadata.full_name === "string"
      ? metadata.full_name
      : typeof metadata.name === "string"
        ? metadata.name
        : null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Chào mừng{fullName ? `, ${fullName}` : ""}!
            </h1>
            <p className="mt-2 text-slate-600">{user.email}</p>
          </div>
          <SignOutButton />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workspace của bạn</CardTitle>
            <CardDescription>
              Bạn đã đăng nhập thành công. Các tính năng Swipe Board, AI
              Breakdown và Remix sẽ được kích hoạt ở sprint tiếp theo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <a href="/">Về trang chủ</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
