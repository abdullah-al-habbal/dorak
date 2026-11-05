import type { Metadata } from "next";
import { Suspense } from "react";

import { StylistsScreen } from "@/components/stylists/stylists-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Stylists" };

export default async function StylistsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <StylistsScreen actor={guard} />
    </Suspense>
  );
}
