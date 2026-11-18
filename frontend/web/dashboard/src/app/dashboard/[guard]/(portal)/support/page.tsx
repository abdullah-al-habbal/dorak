import type { Metadata } from "next";
import { Suspense } from "react";

import { FeedbackScreen } from "@/components/support/feedback-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Support" };

export default async function SupportPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <FeedbackScreen actor={guard} />
    </Suspense>
  );
}
