import type { Metadata } from "next";
import { Suspense } from "react";

import { NotificationsScreen } from "@/components/notifications/notifications-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <NotificationsScreen actor={guard} />
    </Suspense>
  );
}
