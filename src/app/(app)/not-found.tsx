import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AppNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-border/60 bg-surface-elev p-8 text-center">
        <h1 className="text-lg font-semibold">Không tìm thấy trang</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Trang bạn tìm không tồn tại hoặc bạn không có quyền truy cập.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm text-background hover:opacity-90"
        >
          <ArrowLeft className="h-4 w-4" />
          Về Dashboard
        </Link>
      </div>
    </div>
  );
}
