import type { Metadata } from "next";
import { Suspense } from "react";

import { PlansScreen } from "@/components/plans/plans-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Plans" };

export default async function PlansPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PlansScreen actor={guard} />
    </Suspense>
  );
}
