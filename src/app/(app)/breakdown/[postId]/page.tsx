import type { Metadata } from "next";

import { ComingSoonPage } from "@/components/custom/app/coming-soon-page";

type BreakdownPostPageProps = {
  params: { postId: string };
};

export function generateMetadata({ params }: BreakdownPostPageProps): Metadata {
  return {
    title: `Breakdown ${params.postId} · Vietnamese Eden`,
  };
}

export default function BreakdownPostPage({ params }: BreakdownPostPageProps) {
  const { postId } = params;

  return (
    <ComingSoonPage
      title="AI Breakdown"
      subtitle={`Post #${postId}`}
      feature="Chi tiết phân tích AI"
    />
  );
}
