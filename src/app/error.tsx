"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </main>
  );
}
