import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

export const metadata: Metadata = {
  title: "Remix AI · Vietnamese Eden",
};

export default function RemixPage() {
  return (
    <ComingSoonPage
      title="Remix AI"
      subtitle="Tạo biến thể caption từ nội dung gốc"
      feature="Remix AI"
    />
  );
}
