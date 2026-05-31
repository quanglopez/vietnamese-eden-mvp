import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";

export default function BoardNotFound() {
  return (
    <AppShell title="Không tìm thấy bảng" subtitle="Bảng không tồn tại hoặc bạn không có quyền truy cập">
      <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-lg">
        <h2 className="font-display text-xl font-bold">Bảng không khả dụng</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Bảng này có thể đã bị xóa, hoặc bạn không thuộc workspace sở hữu bảng đó.
        </p>
        <Button asChild className="mt-6 gap-2">
          <Link href="/boards">
            <ArrowLeft className="h-4 w-4" />
            Về danh sách bảng
          </Link>
        </Button>
      </div>
    </AppShell>
  );
}
