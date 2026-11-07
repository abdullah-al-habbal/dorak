import type { Metadata } from "next";
import { Suspense } from "react";

import { PlatformSettingsScreen } from "@/components/platform-settings/platform-settings-screen";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ params }: { params: Promise<{ guard: string }> }) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<TableSkeleton />}>
      <PlatformSettingsScreen actor={guard} />
    </Suspense>
  );
}
