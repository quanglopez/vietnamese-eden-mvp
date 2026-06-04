import type { Metadata } from "next";
import Link from "next/link";

import { AppShell } from "@/components/custom/app/app-shell";
import { PaywallBanner } from "@/components/custom/pricing/paywall-banner";
import { PricingCard } from "@/components/custom/pricing/pricing-card";
import { PricingComparison } from "@/components/custom/pricing/pricing-comparison";
import { Button } from "@/components/ui/button";
import { isPricingEnabled } from "@/lib/pricing/feature-flag";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

export const metadata: Metadata = {
  title: "Gói cước · Vietnamese Eden",
};

export default function PricingPage() {
  const pricingEnabled = isPricingEnabled();

  return (
    <AppShell
      title="Gói cước"
      subtitle={
        pricingEnabled
          ? "Chọn gói phù hợp — thanh toán sẽ mở sau"
          : "Beta — tất cả tính năng miễn phí"
      }
    >
      <div className="space-y-8 max-w-6xl">
        {!pricingEnabled ? <PaywallBanner /> : null}

        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {pricingEnabled
            ? "Xem giới hạn từng gói. Checkout Stripe chưa kích hoạt — CTA dẫn waitlist hoặc liên hệ."
            : "Trong giai đoạn beta, bạn dùng đầy đủ board → breakdown → remix → calendar mà không bị chặn. Bảng giá bên dưới là định hướng sản phẩm."}
        </p>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              variant="app"
              pricingEnabled={pricingEnabled}
            />
          ))}
        </ul>

        <PricingComparison />

        <div className="flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/dashboard">Quay lại tổng quan</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/#pricing">Xem gói trên landing</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
