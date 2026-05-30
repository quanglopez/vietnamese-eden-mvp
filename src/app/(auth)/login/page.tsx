import { Suspense } from "react";

import { LoginForm } from "@/components/custom/auth/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense fallback={<AuthFormSkeleton title="Đăng nhập" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

function AuthFormSkeleton({ title }: { title: string }) {
  return (
    <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm">
      <h1 className="text-lg font-semibold">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Đang tải...</p>
    </div>
  );
}
