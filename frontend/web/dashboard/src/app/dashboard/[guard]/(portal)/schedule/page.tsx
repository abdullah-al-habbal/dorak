import type { Metadata } from "next";
import { Suspense } from "react";

import { ScheduleScreen } from "@/components/schedule/schedule-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Schedule" };

export default async function SchedulePage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <ScheduleScreen actor={guard} />
    </Suspense>
  );
}
