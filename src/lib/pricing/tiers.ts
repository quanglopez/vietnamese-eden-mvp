export type PricingTierId = "free" | "creator" | "agency";

export type PricingTierLimits = {
  boards: number | "unlimited";
  voiceProfiles: number | "unlimited";
  remixBatchSize: number | "unlimited";
  teamMembers: number | "unlimited";
};

export type PricingTier = {
  id: PricingTierId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limits: PricingTierLimits;
  highlighted: boolean;
  cta: string;
  /** Landing anchor / external */
  ctaHref: string;
  /** In-app route when logged in */
  ctaAppHref: string;
};

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "free",
    name: "Free / Beta",
    price: "0đ",
    period: "trong giai đoạn beta",
    description: "Dành cho creator thử luồng MVP đầy đủ.",
    features: [
      "Swipe board không giới hạn",
      "AI Breakdown + Remix",
      "1 voice profile",
      "Lịch nội dung 30 ngày",
      "Copy / export output",
    ],
    limits: {
      boards: "unlimited",
      voiceProfiles: 1,
      remixBatchSize: 5,
      teamMembers: 1,
    },
    highlighted: true,
    cta: "Tham gia waitlist",
    ctaHref: "#waitlist",
    ctaAppHref: "/dashboard",
  },
  {
    id: "creator",
    name: "Creator",
    price: "299.000đ",
    period: "/ tháng",
    description: "Cho solo creator làm content hàng ngày.",
    features: [
      "Mọi tính năng Free",
      "5 voice profile",
      "Remix batch 10 biến thể",
      "Ưu tiên queue AI",
      "Hỗ trợ email",
    ],
    limits: {
      boards: "unlimited",
      voiceProfiles: 5,
      remixBatchSize: 10,
      teamMembers: 1,
    },
    highlighted: false,
    cta: "Đăng ký sớm",
    ctaHref: "#waitlist",
    ctaAppHref: "/#waitlist",
  },
  {
    id: "agency",
    name: "Agency",
    price: "Liên hệ",
    period: "theo workspace",
    description: "Cho agency quản nhiều brand và thành viên.",
    features: [
      "Workspace đa thành viên",
      "Board theo client",
      "Voice profile theo brand",
      "Calendar team view",
      "Onboarding riêng",
    ],
    limits: {
      boards: "unlimited",
      voiceProfiles: "unlimited",
      remixBatchSize: "unlimited",
      teamMembers: "unlimited",
    },
    highlighted: false,
    cta: "Liên hệ beta",
    ctaHref: "#waitlist",
    ctaAppHref: "/#waitlist",
  },
];

const FREE_TIER = PRICING_TIERS.find((t) => t.id === "free")!;
const CREATOR_TIER = PRICING_TIERS.find((t) => t.id === "creator")!;
const AGENCY_TIER = PRICING_TIERS.find((t) => t.id === "agency")!;

export const FREE_TIER_LIMITS = FREE_TIER.limits;

export type ComparisonRow = {
  label: string;
  free: string;
  creator: string;
  agency: string;
};

function formatLimit(value: number | "unlimited"): string {
  return value === "unlimited" ? "Không giới hạn" : String(value);
}

export const PRICING_COMPARISON_ROWS: ComparisonRow[] = [
  {
    label: "Bảng cảm hứng",
    free: formatLimit(FREE_TIER.limits.boards),
    creator: formatLimit(CREATOR_TIER.limits.boards),
    agency: formatLimit(AGENCY_TIER.limits.boards),
  },
  {
    label: "Voice profile",
    free: formatLimit(FREE_TIER.limits.voiceProfiles),
    creator: formatLimit(CREATOR_TIER.limits.voiceProfiles),
    agency: formatLimit(AGENCY_TIER.limits.voiceProfiles),
  },
  {
    label: "Remix mỗi lần (batch)",
    free: formatLimit(FREE_TIER.limits.remixBatchSize),
    creator: formatLimit(CREATOR_TIER.limits.remixBatchSize),
    agency: formatLimit(AGENCY_TIER.limits.remixBatchSize),
  },
  {
    label: "Thành viên workspace",
    free: formatLimit(FREE_TIER.limits.teamMembers),
    creator: formatLimit(CREATOR_TIER.limits.teamMembers),
    agency: formatLimit(AGENCY_TIER.limits.teamMembers),
  },
  {
    label: "AI Breakdown + Remix",
    free: "Có",
    creator: "Có",
    agency: "Có",
  },
  {
    label: "Lịch 30 ngày",
    free: "Có",
    creator: "Có",
    agency: "Có",
  },
  {
    label: "Thanh toán Stripe",
    free: "Chưa (beta)",
    creator: "Sắp mở",
    agency: "Liên hệ",
  },
];
