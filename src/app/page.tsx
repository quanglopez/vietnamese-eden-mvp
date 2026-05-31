import type { Metadata } from "next";

import { LandingPage } from "@/components/custom/landing/landing-page";

export const metadata: Metadata = {
  title: "Vietnamese Eden — AI content workspace cho creator Việt",
  description:
    "Lưu bài viral, phân tích hook/angle/CTA, remix tiếng Việt theo giọng viết, đưa output vào lịch nội dung. Tham gia beta waitlist.",
  openGraph: {
    title: "Vietnamese Eden",
    description: "AI content workspace cho creator và agency Việt Nam",
    locale: "vi_VN",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
