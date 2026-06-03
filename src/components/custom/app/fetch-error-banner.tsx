"use client";

import { useRouter } from "next/navigation";

type FetchErrorBannerProps = {
  message: string;
};

export function FetchErrorBanner({ message }: FetchErrorBannerProps) {
  const router = useRouter();

  return (
    <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive flex flex-wrap items-start justify-between gap-3 min-w-0">
      <p className="min-w-0 flex-1">{message}</p>
      <button
        type="button"
        onClick={() => router.refresh()}
        className="shrink-0 text-xs font-medium text-destructive underline hover:no-underline"
      >
        Thử lại
      </button>
    </div>
  );
}
