# Cursor Prompt — ALE-174: Pricing/Paywall Readiness

**Issue:** ALE-174 — M11 — Pricing/paywall readiness
**Linear:** https://linear.app/alexgpt/issue/ALE-174/m11-pricingpaywall-readiness
**Branch:** `anh555056/ale-174-m11-pricingpaywall-readiness`
**Base:** `main` (current HEAD: `743ddd1`)

---

## 1. What to build

Feature-flagged pricing/paywall scaffolding. The pricing page already exists as a placeholder — enhance it with proper tier cards, feature comparison, and a paywall limit component that is **disabled by default** via environment variable.

**Key constraint:** No live payment collection. No Stripe integration. No migration. The paywall component exists but does NOT block production users until explicitly enabled.

---

## 2. Current state

| Component | Status |
|-----------|--------|
| `/pricing` page | Placeholder — "Beta — chưa mở bán trong MVP" |
| Landing `/#pricing` | 3 tiers defined (Free/Beta, Creator 299k, Pro/Agency) |
| `PRICING_TIERS` constant | `landing-content.ts` — static data, 3 tiers |
| Stripe code | None (text references only) |
| Feature flags | None (`NEXT_PUBLIC_PRICING_ENABLED` does not exist) |
| Subscription tables | None in database |
| Paywall components | None |
| `.env.local` | Only `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

---

## 3. Implementation approach

### 3a. Feature flag

Add `NEXT_PUBLIC_PRICING_ENABLED` environment variable:
- Default: `false` (in `.env.local.example` and Vercel)
- When `false`: pricing page shows "coming soon" message, paywall component is hidden
- When `true`: pricing page shows full tier cards with CTA buttons, paywall component activates

### 3b. Pricing page upgrade

Replace the current placeholder `/pricing` page with:
- 3 tier cards (Free, Creator, Agency) — reuse `PRICING_TIERS` from `landing-content.ts`
- Feature comparison table
- "Coming soon" banner when `NEXT_PUBLIC_PRICING_ENABLED=false`
- Vietnamese copy throughout
- No Stripe checkout buttons (CTA → waitlist or "Liên hệ")

### 3c. Paywall limit component

Create `<PaywallLimit>` component:
- Wraps feature content (e.g., remix batch size, voice profiles)
- When `NEXT_PUBLIC_PRICING_ENABLED=false`: renders children normally (no blocking)
- When `NEXT_PUBLIC_PRICING_ENABLED=true`: shows upgrade prompt if user exceeds free tier limits
- Props: `feature`, `current`, `limit`, `children`
- Vietnamese copy: "Bạn đã đạt giới hạn gói Free. Nâng cấp Creator để tiếp tục."

### 3d. Tier definitions

```typescript
// src/lib/pricing/tiers.ts

export type PricingTier = {
  id: 'free' | 'creator' | 'agency';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: {
    boards: number | 'unlimited';
    voiceProfiles: number | 'unlimited';
    remixBatchSize: number | 'unlimited';
    teamMembers: number | 'unlimited';
  };
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free / Beta',
    price: '0đ',
    period: 'trong giai đoạn beta',
    description: 'Dành cho creator thử luồng MVP đầy đủ.',
    features: [
      'Swipe board không giới hạn',
      'AI Breakdown + Remix',
      '1 voice profile',
      'Lịch nội dung 30 ngày',
      'Copy / export output',
    ],
    limits: {
      boards: 'unlimited',
      voiceProfiles: 1,
      remixBatchSize: 5,
      teamMembers: 1,
    },
  },
  {
    id: 'creator',
    name: 'Creator',
    price: '299.000đ',
    period: '/ tháng',
    description: 'Cho solo creator làm content hàng ngày.',
    features: [
      'Mọi tính năng Free',
      'Nhiều voice profile',
      'Remix batch lớn hơn',
      'Ưu tiên queue AI',
      'Hỗ trợ email',
    ],
    limits: {
      boards: 'unlimited',
      voiceProfiles: 5,
      remixBatchSize: 10,
      teamMembers: 1,
    },
  },
  {
    id: 'agency',
    name: 'Pro / Agency',
    price: 'Liên hệ',
    period: 'theo workspace',
    description: 'Cho agency quản nhiều brand và thành viên.',
    features: [
      'Workspace đa thành viên',
      'Board theo client',
      'Voice profile theo brand',
      'Calendar team view',
      'Onboarding riêng',
    ],
    limits: {
      boards: 'unlimited',
      voiceProfiles: 'unlimited',
      remixBatchSize: 'unlimited',
      teamMembers: 'unlimited',
    },
  },
];
```

---

## 4. Files to create/change

### New files:

| File | Purpose |
|------|---------|
| `src/lib/pricing/tiers.ts` | Tier definitions with limits |
| `src/lib/pricing/feature-flag.ts` | `isPricingEnabled()` helper |
| `src/components/custom/pricing/pricing-card.tsx` | Tier card component |
| `src/components/custom/pricing/pricing-comparison.tsx` | Feature comparison table |
| `src/components/custom/pricing/paywall-limit.tsx` | Paywall limit wrapper |
| `src/components/custom/pricing/paywall-banner.tsx` | "Coming soon" banner |

### Modified files:

| File | Change |
|------|--------|
| `src/app/(app)/pricing/page.tsx` | Replace placeholder with full pricing page |
| `src/components/custom/landing/landing-content.ts` | Update `PRICING_TIERS` to use new tier type |
| `src/components/custom/landing/landing-pricing.tsx` | Minor copy update |
| `.env.local.example` | Add `NEXT_PUBLIC_PRICING_ENABLED=false` |

### Files NOT to change:

- No Stripe SDK installation
- No payment API routes
- No subscription database tables
- No migration
- No auth changes
- No billing webhook handlers
- No changes to beta-testers, feedback, analytics

---

## 5. Feature flag design

```typescript
// src/lib/pricing/feature-flag.ts

export function isPricingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PRICING_ENABLED === 'true';
}
```

**Usage:**
- Pricing page: `if (!isPricingEnabled()) return <ComingSoonBanner />`
- Paywall component: `if (!isPricingEnabled()) return children`
- Sidebar: pricing link always visible (already exists)

**Environment:**
- `.env.local.example`: `NEXT_PUBLIC_PRICING_ENABLED=false`
- Vercel production: `NEXT_PUBLIC_PRICING_ENABLED=false` (do NOT set to true)
- Local dev: can set to `true` for testing

---

## 6. Pricing tier copy (Vietnamese)

| Tier | Price | Period | CTA |
|------|-------|--------|-----|
| Free / Beta | 0đ | trong giai đoạn beta | Tham gia waitlist |
| Creator | 299.000đ | / tháng | Đăng ký sớm |
| Pro / Agency | Liên hệ | theo workspace | Liên hệ beta |

**Coming soon banner:**
> "Gói cước sẽ sớm ra mắt. Hiện tại tất cả tính năng đều miễn phí trong giai đoạn beta."

**Paywall limit message:**
> "Bạn đã đạt giới hạn {feature} của gói Free. Nâng cấp Creator để tiếp tục."

---

## 7. Paywall behavior

| State | `NEXT_PUBLIC_PRICING_ENABLED` | Behavior |
|-------|-------------------------------|----------|
| Beta (default) | `false` | All features free, no limits enforced, "coming soon" on pricing page |
| Pricing active | `true` | Tier cards with CTA, paywall limits enforced, upgrade prompts shown |

**Critical:** The paywall component MUST render children normally when flag is `false`. It MUST NOT block any production user in beta.

---

## 8. Stripe/no-payment guardrails

### DO:
- Reference Stripe in docs/comments as "future integration point"
- Design tier limits that map to Stripe price IDs (future)
- Keep `PRICING_TIERS` data structure compatible with Stripe product/price objects

### DO NOT:
- Install `stripe` npm package
- Create `/api/stripe/*` routes
- Create webhook handlers
- Create subscription database tables
- Collect payment information
- Redirect to Stripe checkout
- Store Stripe customer IDs

---

## 9. Migration needed: NO

No migration needed. The pricing scaffolding is purely client-side with feature flags. No database changes required.

---

## 10. Verification checklist

```bash
npm run lint          # PASS
npm run type-check    # PASS
npm run build         # PASS
```

---

## 11. Smoke checklist

| # | Test | Expected |
|---|------|----------|
| 1 | Login as workspace admin | Dashboard loads |
| 2 | Navigate to /pricing | "Coming soon" banner (flag=false) |
| 3 | Pricing tiers visible | 3 cards: Free, Creator, Agency |
| 4 | Vietnamese copy | All labels in Vietnamese |
| 5 | Feature comparison | Table renders with tier features |
| 6 | Paywall component hidden | No upgrade prompts (flag=false) |
| 7 | Sidebar "Gói cước" | Link navigates to /pricing |
| 8 | Landing /#pricing | Still renders 3 tiers |
| 9 | /admin/feedback unaffected | Page loads normally |
| 10 | /admin/beta-testers unaffected | Page loads normally |
| 11 | /admin/analytics unaffected | Page loads normally |
| 12 | /dashboard unaffected | Page loads normally |
| 13 | /boards unaffected | Page loads normally |
| 14 | No Stripe code in bundle | grep stripe returns 0 matches |
| 15 | No console/runtime errors | Zero JS errors |

---

## 12. Scope limits

### IN scope:
- Feature flag (`NEXT_PUBLIC_PRICING_ENABLED`)
- Pricing page with tier cards
- Feature comparison table
- Paywall limit component (disabled by default)
- "Coming soon" banner
- Vietnamese copy
- Tier definitions with limits

### OUT of scope (do NOT implement):
- Stripe SDK installation
- Payment API routes
- Webhook handlers
- Subscription database tables
- Migration
- Live payment collection
- Billing portal
- Invoice generation
- Usage tracking/metering
- Hard paywall enforcement
