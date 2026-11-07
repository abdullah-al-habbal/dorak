import type { Metadata } from "next";
import { Suspense } from "react";

import { SubscriptionScreen } from "@/components/subscription/subscription-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Subscription" };

export default async function SubscriptionPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <SubscriptionScreen actor={guard} />
    </Suspense>
  );
}
