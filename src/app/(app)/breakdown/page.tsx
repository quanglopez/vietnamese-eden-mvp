import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

export const metadata: Metadata = {
  title: "AI Breakdown · Vietnamese Eden",
};

export default function BreakdownIndexPage() {
  return (
    <ComingSoonPage
      title="AI Breakdown"
      subtitle="Bóc tách hook, cấu trúc và lý do viral"
      feature="Phân tích nội dung bằng AI"
    />
  );
}
