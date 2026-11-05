import type { Metadata } from "next";
import { Suspense } from "react";

import { ServicesScreen } from "@/components/services/services-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Services" };

export default async function ServicesPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ServicesScreen actor={guard} />
    </Suspense>
  );
}
