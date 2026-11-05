import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsScreen } from "@/components/bookings/bookings-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <BookingsScreen actor={guard} />
    </Suspense>
  );
}
