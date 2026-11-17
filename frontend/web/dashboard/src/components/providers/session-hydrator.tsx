"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { loginRoute } from "@/config/routes.constant";
import { useAuthStore } from "@/hooks/core/state/use-auth-store";
import type { SessionHydratorProps } from "@/interfaces/ui/shell/session-hydrator-props.interface";
import { onSessionExpired } from "@/services/api/core/session-expiry.util";

/** Clears the client session and returns to sign-in when the API reports the session expired. */
export function SessionHydrator({ actor }: SessionHydratorProps): null {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(
    () =>
      onSessionExpired(() => {
        clearSession();
        router.replace(loginRoute(actor));
      }),
    [actor, clearSession, router],
  );

  return null;
}
