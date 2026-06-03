"use client";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <h1 className="text-lg font-semibold">Đã xảy ra lỗi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Không thể tải trang này. Vui lòng thử lại.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
