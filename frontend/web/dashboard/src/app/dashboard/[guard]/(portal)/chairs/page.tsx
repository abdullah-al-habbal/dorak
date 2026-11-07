import type { Metadata } from "next";
import { Suspense } from "react";

import { ChairsScreen } from "@/components/chairs/chairs-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Chairs" };

export default async function ChairsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ChairsScreen actor={guard} />
    </Suspense>
  );
}
