import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/custom/app/app-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Gói cước · Vietnamese Eden",
};

export default function PricingPage() {
  return (
    <AppShell title="Gói cước" subtitle="Beta — chưa mở bán trong MVP">
      <div className="rounded-2xl border border-border/60 bg-surface-elev p-8 max-w-xl">
        <p className="text-muted-foreground leading-relaxed">
          Phiên bản beta hiện tập trung vào board → breakdown → remix → calendar. Xem bảng giá đầy
          đủ trên trang chủ — billing Stripe sẽ bật sau beta.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/#pricing">Xem gói trên landing</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Quay lại tổng quan</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
