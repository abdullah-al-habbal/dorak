import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminSubscriptionsScreen } from "@/components/admin-subscriptions/admin-subscriptions-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminSubscriptionsScreen actor={guard} />
    </Suspense>
  );
}
