import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

export const metadata: Metadata = {
  title: "Giọng văn · Vietnamese Eden",
};

export default function VoicePage() {
  return (
    <ComingSoonPage
      title="Giọng văn"
      subtitle="Huấn luyện AI học phong cách viết của bạn"
      feature="Voice Profile"
    />
  );
}
