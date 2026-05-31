import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RemixView } from "@/components/custom/remix/remix-view";
import { getRemixPageContext, listGeneratedOutputsByItemId } from "@/lib/content/remix-queries";
import { createClient } from "@/lib/supabase/server";
import { isValidUuid } from "@/lib/boards/utils";

type RemixItemPageProps = {
  params: { contentItemId: string };
};

export const metadata: Metadata = {
  title: "Remix Generator · Vietnamese Eden",
  description: "Tạo biến thể nội dung từ AI breakdown",
};

export default async function RemixItemPage({ params }: RemixItemPageProps) {
  const { contentItemId } = params;

  if (!isValidUuid(contentItemId)) {
    notFound();
  }

  const supabase = createClient();
  const { context, error: contextError } = await getRemixPageContext(supabase, contentItemId);

  if (!context) {
    notFound();
  }

  const { outputs, error: outputsError } = await listGeneratedOutputsByItemId(
    supabase,
    contentItemId,
  );

  const fetchError = [contextError, outputsError].filter(Boolean).join(" ") || null;

  return <RemixView context={context} outputs={outputs} fetchError={fetchError} />;
}
