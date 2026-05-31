import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

type BoardDetailPageProps = {
  params: { boardId: string };
};

export function generateMetadata({ params }: BoardDetailPageProps): Metadata {
  return {
    title: `Board ${params.boardId} · Vietnamese Eden`,
  };
}

export default function BoardDetailPage({ params }: BoardDetailPageProps) {
  return (
    <ComingSoonPage
      title="Bảng cảm hứng"
      subtitle={`Board: ${params.boardId}`}
      feature="Chi tiết bảng cảm hứng"
    />
  );
}
