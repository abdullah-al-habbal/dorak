import type { Metadata } from "next";
import { Suspense } from "react";

import { BookingsSkeleton } from "@/components/bookings/booking-states";
import { BookingsScreen } from "@/components/bookings/bookings-screen";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Bookings" };

export default async function BookingsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<BookingsSkeleton />}>
      <BookingsScreen actor={guard} />
    </Suspense>
  );
}
