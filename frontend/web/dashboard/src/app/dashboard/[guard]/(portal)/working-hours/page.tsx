import type { Metadata } from "next";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { WorkingHoursScreen } from "@/components/working-hours/working-hours-screen";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Working hours" };

export default async function WorkingHoursPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <WorkingHoursScreen actor={guard} />
    </Suspense>
  );
}
