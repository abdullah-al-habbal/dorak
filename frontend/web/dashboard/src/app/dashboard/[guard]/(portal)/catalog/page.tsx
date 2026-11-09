import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminCatalogScreen } from "@/components/admin-catalog/admin-catalog-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Catalog" };

export default async function CatalogPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminCatalogScreen actor={guard} />
    </Suspense>
  );
}
