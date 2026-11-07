import type { Metadata } from "next";
import { Suspense } from "react";

import { ReviewsScreen } from "@/components/reviews/reviews-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ReviewsScreen actor={guard} />
    </Suspense>
  );
}
