import Link from "next/link";

import { PricingCard } from "@/components/custom/pricing/pricing-card";
import { PaywallBanner } from "@/components/custom/pricing/paywall-banner";
import { isPricingEnabled } from "@/lib/pricing/feature-flag";
import { PRICING_TIERS } from "@/lib/pricing/tiers";

export function LandingPricing() {
  const pricingEnabled = isPricingEnabled();

  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl min-w-0">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">Gói cước</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          {pricingEnabled
            ? "Gói trả phí sắp mở — beta vẫn miễn phí cho đến khi bật billing."
            : "Beta miễn phí. Gói trả phí là định hướng — chưa bật Stripe trong MVP."}
        </p>

        {!pricingEnabled ? (
          <div className="mx-auto mt-8 max-w-2xl">
            <PaywallBanner />
          </div>
        ) : null}

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              variant="landing"
              pricingEnabled={pricingEnabled}
            />
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Đã có tài khoản beta?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Đăng nhập app
          </Link>
        </p>
      </div>
    </section>
  );
}
