import { SessionProvider } from "@/components/auth/session-provider";
import { PortalShell } from "@/components/portal/portal-shell";
import { getServerI18n } from "@/i18n/server";
import { ROUTES } from "@/config/routes.constant";
import { getPortalTitle } from "@/config/routes.util";
import { getServerSession } from "@/services/api/auth/session.query";
import type { AuthActor } from "@/services/api/auth/auth.types";
import { redirect } from "next/navigation";

interface PortalLayoutProps {
  actor: AuthActor;
  children: React.ReactNode;
}

export async function PortalLayout({ actor, children }: PortalLayoutProps) {
  const [session, { dictionary }] = await Promise.all([
    getServerSession(),
    getServerI18n(),
  ]);

  // Proxy performs the fast routing check. The layout repeats the canonical
  // backend `/dashboard/me` check so a revoked/invalid access token cannot
  // render a protected RSC response.
  if (session === null) {
    redirect(ROUTES.portal[actor].login);
  }

  if (session.actor !== actor) {
    redirect(ROUTES.portal[session.actor].root);
  }

  return (
    <SessionProvider session={session}>
      <PortalShell title={getPortalTitle(actor, dictionary)}>
        {children}
      </PortalShell>
    </SessionProvider>
  );
}
