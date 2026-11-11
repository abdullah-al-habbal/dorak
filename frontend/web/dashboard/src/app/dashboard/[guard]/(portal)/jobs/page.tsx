import type { Metadata } from "next";
import { Suspense } from "react";

import { JobsScreen } from "@/components/jobs/jobs-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Job postings" };

export default async function JobsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <JobsScreen actor={guard} />
    </Suspense>
  );
}
