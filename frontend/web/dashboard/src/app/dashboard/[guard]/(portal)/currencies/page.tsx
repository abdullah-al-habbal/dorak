import type { Metadata } from "next";
import { Suspense } from "react";

import { CurrenciesScreen } from "@/components/currencies/currencies-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Currencies" };

export default async function CurrenciesPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <CurrenciesScreen actor={guard} />
    </Suspense>
  );
}
