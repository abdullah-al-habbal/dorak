import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { PortalShell } from "@/components/layout/portal-shell";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { SIDEBAR_COOKIE } from "@/config/cookies.constant";
import { loginRoute, portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { getServerSession } from "@/services/api/auth/server-session";

/** Reads the session at request time, so it must render behind a Suspense boundary. */
export async function PortalSession({ guard, children }: { guard: AuthActor; children: ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect(loginRoute(guard));
  if (session.actor !== guard) redirect(portalRoot(session.actor));

  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "1";
  return (
    <PortalShell actor={guard} profile={session.profile}>
      <SessionHydrator actor={guard} profile={session.profile} sidebarCollapsed={collapsed} />
      {children}
    </PortalShell>
  );
}
