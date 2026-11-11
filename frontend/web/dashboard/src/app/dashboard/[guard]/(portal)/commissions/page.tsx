import type { Metadata } from "next";
import { Suspense } from "react";

import { CommissionsScreen } from "@/components/commissions/commissions-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Commissions" };

export default async function CommissionsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CommissionsScreen actor={guard} />
    </Suspense>
  );
}
