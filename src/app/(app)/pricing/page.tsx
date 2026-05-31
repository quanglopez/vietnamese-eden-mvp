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
          Phiên bản beta hiện tập trung vào board → breakdown → remix → calendar. Billing và giới
          hạn usage sẽ có ở sprint sau.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/dashboard">Quay lại tổng quan</Link>
        </Button>
      </div>
    </AppShell>
  );
}
