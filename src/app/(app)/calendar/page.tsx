import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

export const metadata: Metadata = {
  title: "Lịch 30 ngày · Vietnamese Eden",
};

export default function CalendarPage() {
  return (
    <ComingSoonPage
      title="Lịch 30 ngày"
      subtitle="Lên kế hoạch nội dung theo lịch"
      feature="Content Calendar"
    />
  );
}
