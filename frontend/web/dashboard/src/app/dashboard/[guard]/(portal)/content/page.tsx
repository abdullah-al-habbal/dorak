import type { Metadata } from "next";
import { Suspense } from "react";

import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { WebsiteContentScreen } from "@/components/website-content/website-content-screen";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Website content" };

export default async function WebsiteContentPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <WebsiteContentScreen actor={guard} />
    </Suspense>
  );
}
