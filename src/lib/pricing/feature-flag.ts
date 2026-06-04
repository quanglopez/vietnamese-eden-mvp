/**
 * Pricing/paywall feature flag. Default off — all features free in beta.
 * Future: map tier limits to Stripe price IDs when billing ships.
 */
export function isPricingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRICING_ENABLED === "true";
}
