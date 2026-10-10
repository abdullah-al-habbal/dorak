import type { AuthActor } from "@/services/api/auth/auth.types";
import { PortalLayout } from "@/components/portal/portal-layout";

export function createPortalLayout(actor: AuthActor) {
  return function ActorPortalLayout({ children }: { children: React.ReactNode }) {
    return <PortalLayout actor={actor}>{children}</PortalLayout>;
  };
}
