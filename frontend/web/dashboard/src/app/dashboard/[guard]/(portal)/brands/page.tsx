import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminBrandsScreen } from "@/components/admin-brands/admin-brands-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Brands" };

export default async function BrandsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminBrandsScreen actor={guard} />
    </Suspense>
  );
}
