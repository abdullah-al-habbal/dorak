import type { Metadata } from "next";
import { Suspense } from "react";

import { AnalyticsScreen } from "@/components/analytics/analytics-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AnalyticsScreen actor={guard} />
    </Suspense>
  );
}
