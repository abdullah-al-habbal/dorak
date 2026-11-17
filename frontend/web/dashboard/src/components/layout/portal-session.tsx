import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { JSX, ReactNode } from "react";

import { AuthStoreProvider } from "@/components/providers/auth-store-provider";
import { OverlayProvider } from "@/components/overlays/overlay-provider";
import { PortalShell } from "@/components/layout/portal-shell";
import { SessionHydrator } from "@/components/providers/session-hydrator";
import { SidebarProvider } from "@/components/providers/sidebar-provider";
import { SIDEBAR_COOKIE } from "@/config/cookies.constant";
import { loginRoute, portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { parseSidebarCookie } from "@/lib/core/errors/sidebar.util";
import { getServerSession } from "@/services/api/auth/server-session";

/** Reads the session at request time, so it must render behind a Suspense boundary. */
export async function PortalSession({ guard, children }: { guard: AuthActor; children: ReactNode }): Promise<JSX.Element> {
  const session = await getServerSession();
  if (!session) redirect(loginRoute(guard));
  if (session.actor !== guard) redirect(portalRoot(session.actor));

  const collapsed = parseSidebarCookie((await cookies()).get(SIDEBAR_COOKIE)?.value);
  return (
    <AuthStoreProvider actor={guard} profile={session.profile}>
      <SidebarProvider initialCollapsed={collapsed}>
        <OverlayProvider>
          <PortalShell actor={guard} profile={session.profile}>
            <SessionHydrator actor={guard} />
            {children}
          </PortalShell>
        </OverlayProvider>
      </SidebarProvider>
    </AuthStoreProvider>
  );
}
