"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { isPricingEnabled } from "@/lib/pricing/feature-flag";

type PaywallLimitProps = {
  /** Vietnamese feature label, e.g. "voice profile" */
  feature: string;
  current: number;
  limit: number;
  children: ReactNode;
};

/**
 * Soft paywall wrapper — disabled when NEXT_PUBLIC_PRICING_ENABLED is not "true".
 * Future: connect limits to subscription tier from Stripe.
 */
export function PaywallLimit({ feature, current, limit, children }: PaywallLimitProps) {
  if (!isPricingEnabled()) {
    return <>{children}</>;
  }

  if (current <= limit) {
    return <>{children}</>;
  }

  return (
    <div className="space-y-3">
      <div
        className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
        role="alert"
      >
        <p className="leading-relaxed">
          Bạn đã đạt giới hạn {feature} của gói Free.{" "}
          <Link href="/pricing" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Nâng cấp Creator
          </Link>{" "}
          để tiếp tục.
        </p>
      </div>
      {children}
    </div>
  );
}
