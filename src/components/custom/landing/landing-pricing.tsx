import Link from "next/link";
import { Check } from "lucide-react";

import { PRICING_TIERS } from "@/components/custom/landing/landing-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function LandingPricing() {
  return (
    <section id="pricing" className="scroll-mt-20 border-t border-border/60 px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-bold tracking-tight text-center">Gói cước</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Beta miễn phí. Gói trả phí là định hướng — chưa bật Stripe trong MVP.
        </p>
        <ul className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING_TIERS.map((tier) => (
            <li
              key={tier.id}
              className={`flex flex-col rounded-2xl border p-6 ${
                tier.highlighted
                  ? "border-brand/50 bg-surface-elev shadow-glow ring-1 ring-brand/20"
                  : "border-border/60 bg-surface-elev"
              }`}
            >
              {tier.highlighted ? (
                <Badge className="mb-3 w-fit bg-gradient-brand text-white border-0">
                  Đang mở beta
                </Badge>
              ) : null}
              <h3 className="font-display text-xl font-bold">{tier.name}</h3>
              <p className="mt-2 font-display text-3xl font-bold">{tier.price}</p>
              <p className="text-sm text-muted-foreground">{tier.period}</p>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {tier.description}
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-6 w-full ${
                  tier.highlighted
                    ? "bg-foreground text-background hover:bg-foreground/90"
                    : ""
                }`}
                variant={tier.highlighted ? "default" : "outline"}
              >
                <a href={tier.ctaHref}>{tier.cta}</a>
              </Button>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Đã có tài khoản beta?{" "}
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Đăng nhập app
          </Link>
        </p>
      </div>
    </section>
  );
}
