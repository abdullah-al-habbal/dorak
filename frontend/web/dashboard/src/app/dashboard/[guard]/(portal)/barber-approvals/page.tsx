import type { Metadata } from "next";
import { Suspense } from "react";

import { BarberApprovalsScreen } from "@/components/barber-approvals/barber-approvals-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Barber approvals" };

export default async function BarberApprovalsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BarberApprovalsScreen actor={guard} />
    </Suspense>
  );
}
