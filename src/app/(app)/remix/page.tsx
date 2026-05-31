import type { Metadata } from "next";

import { MvpFeatureHub } from "@/components/custom/app/mvp-feature-hub";

export const metadata: Metadata = {
  title: "Remix AI · Vietnamese Eden",
};

export default function RemixIndexPage() {
  return (
    <MvpFeatureHub
      title="Remix Generator"
      subtitle="Tạo biến thể nội dung từ breakdown"
      description="Remix được tạo từ content item đã có AI Breakdown. Mỗi item có trang remix riêng với form format, tone và voice profile."
      steps={[
        "Hoàn tất AI Breakdown cho content item.",
        "Bấm Tạo remix hoặc Phân tích AI → Tạo remix trên trang breakdown.",
        "Chọn format, tone, voice profile (tuỳ chọn) và số biến thể.",
      ]}
    />
  );
}
