import { portalProfileFor } from "@/config/routes.util";
import type { AuthActor } from "@/services/api/auth/types/auth.types";
import { redirect } from "next/navigation";

export function createPortalProfileRedirect(actor: AuthActor) {
  return function PortalProfileRedirect() {
    redirect(portalProfileFor(actor).account);
  };
}
