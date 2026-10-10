"use client";

import { useEffect } from "react";
import { ROUTES } from "@/config/routes.constant";
import { useReplaceAndRefresh } from "@/hooks/use-replace-and-refresh";
import type { AuthActor } from "@/services/api/auth/auth.types";
import { subscribeSessionExpiry } from "@/services/api/session-expiry";

/**
 * Sends the viewer to their portal login when a session-scoped request returns 401.
 * Scoped to the portal session so public routes never listen, and keyed on the
 * actor so navigation does not resubscribe. Concurrent 401s redirect once.
 */
export function useSessionExpiryRedirect(actor: AuthActor) {
  const navigate = useReplaceAndRefresh();

  useEffect(() => {
    let redirected = false;

    return subscribeSessionExpiry(() => {
      if (redirected) return;
      redirected = true;
      navigate(ROUTES.portal[actor].login);
    });
  }, [actor, navigate]);
}
