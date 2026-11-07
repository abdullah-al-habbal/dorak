import type { Metadata } from "next";
import { Suspense } from "react";

import { PayoutsScreen } from "@/components/payouts/payouts-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Payouts" };

export default async function PayoutsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PayoutsScreen actor={guard} />
    </Suspense>
  );
}
