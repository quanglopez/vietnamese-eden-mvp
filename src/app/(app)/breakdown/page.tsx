import type { Metadata } from "next";

import { MvpFeatureHub } from "@/components/custom/app/mvp-feature-hub";

export const metadata: Metadata = {
  title: "AI Breakdown · Vietnamese Eden",
};

export default function BreakdownIndexPage() {
  return (
    <MvpFeatureHub
      title="AI Breakdown"
      subtitle="Bóc tách hook, cấu trúc và lý do viral"
      description="Phân tích AI chạy trên từng content item trong bảng cảm hứng. Chọn một item có nội dung text, rồi bấm Phân tích AI."
      steps={[
        "Vào Bảng cảm hứng và mở một board.",
        "Thêm content bằng Paste text (hoặc URL + text sau).",
        "Bấm Phân tích AI trên card content hoặc mở trang breakdown.",
      ]}
    />
  );
}
