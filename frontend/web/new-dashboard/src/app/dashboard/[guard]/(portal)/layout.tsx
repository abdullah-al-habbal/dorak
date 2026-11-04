import { Suspense } from "react";

import { RouteProgress } from "@/components/feedback/route-progress";
import { PortalSession } from "@/components/layout/portal-session";
import { parseGuardOrNotFound } from "@/lib/parse-guard";

export default async function PortalLayout({ children, params }: LayoutProps<"/dashboard/[guard]">) {
  const guard = parseGuardOrNotFound((await params).guard);
  return (
    <Suspense fallback={<RouteProgress />}>
      <PortalSession guard={guard}>{children}</PortalSession>
    </Suspense>
  );
}
