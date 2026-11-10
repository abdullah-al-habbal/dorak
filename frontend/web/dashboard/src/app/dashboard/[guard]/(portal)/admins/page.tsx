import type { Metadata } from "next";
import { Suspense } from "react";

import { AdminUsersScreen } from "@/components/admin-users/admin-users-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Admins" };

export default async function AdminUsersPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <AdminUsersScreen actor={guard} />
    </Suspense>
  );
}
