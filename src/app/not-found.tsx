import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm text-center">
        <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc đã bị di chuyển.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          Về Dashboard
        </Link>
      </div>
    </main>
  );
}
