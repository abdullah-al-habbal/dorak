"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { loginRoute } from "@/config/routes.constant";
import type { SessionHydratorProps } from "@/interfaces/session-hydrator-props.interface";
import { onSessionExpired } from "@/services/api/core/session-expiry.util";
import { useAuthStore } from "@/store/auth.store";

/** Copies the server-verified session into client stores. Runs only in the browser, so no state leaks between requests. */
export function SessionHydrator({ actor, profile }: SessionHydratorProps) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    setSession(actor, profile);
  }, [actor, profile, setSession]);

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
