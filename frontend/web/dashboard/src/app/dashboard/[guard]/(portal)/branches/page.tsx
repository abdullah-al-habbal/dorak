import type { Metadata } from "next";
import { Suspense } from "react";

import { BranchesScreen } from "@/components/branches/branches-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Branches" };

export default async function BranchesPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BranchesScreen actor={guard} />
    </Suspense>
  );
}
