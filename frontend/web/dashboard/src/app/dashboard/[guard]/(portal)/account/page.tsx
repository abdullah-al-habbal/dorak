import type { Metadata } from "next";
import { Suspense } from "react";

import { AccountScreen } from "@/components/account/account-screen";
import { Skeleton } from "@/components/ui/skeleton";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage({ params }: PageProps<"/dashboard/[guard]/account">) {
  parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AccountScreen />
    </Suspense>
  );
}
