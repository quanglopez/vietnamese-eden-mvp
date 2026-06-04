import Link from "next/link";
import { Check } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PricingTier } from "@/lib/pricing/tiers";

type PricingCardProps = {
  tier: PricingTier;
  variant: "landing" | "app";
  pricingEnabled: boolean;
};

function resolveCta(
  tier: PricingTier,
  variant: PricingCardProps["variant"],
  pricingEnabled: boolean,
): { href: string; label: string; useAnchor: boolean } {
  if (variant === "landing") {
    return {
      href: tier.ctaHref,
      label: tier.cta,
      useAnchor: tier.ctaHref.startsWith("#"),
    };
  }

  if (!pricingEnabled) {
    if (tier.id === "free") {
      return { href: "/dashboard", label: "Bắt đầu miễn phí", useAnchor: false };
    }
    return { href: "/#waitlist", label: tier.cta, useAnchor: false };
  }

  return {
    href: tier.ctaAppHref,
    label: tier.cta,
    useAnchor: tier.ctaAppHref.startsWith("#"),
  };
}

export function PricingCard({ tier, variant, pricingEnabled }: PricingCardProps) {
  const { href, label, useAnchor } = resolveCta(tier, variant, pricingEnabled);

  return (
    <li
      className={`flex flex-col rounded-2xl border p-6 min-w-0 ${
        tier.highlighted
          ? "border-brand/50 bg-surface-elev shadow-glow ring-1 ring-brand/20"
          : "border-border/60 bg-surface-elev"
      }`}
    >
      {tier.highlighted ? (
        <Badge className="mb-3 w-fit bg-gradient-brand text-white border-0">Đang mở beta</Badge>
      ) : null}
      <h3 className="font-display text-xl font-bold">{tier.name}</h3>
      <p className="mt-2 font-display text-2xl sm:text-3xl font-bold break-words">{tier.price}</p>
      <p className="text-sm text-muted-foreground">{tier.period}</p>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{tier.description}</p>
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
          tier.highlighted ? "bg-foreground text-background hover:bg-foreground/90" : ""
        }`}
        variant={tier.highlighted ? "default" : "outline"}
      >
        {useAnchor ? (
          <a href={href}>{label}</a>
        ) : (
          <Link href={href}>{label}</Link>
        )}
      </Button>
    </li>
  );
}
