"use client";

import { SessionContext } from "@/components/auth/session-context";
import { useSessionExpiryRedirect } from "@/hooks/use-session-expiry-redirect";
import type { AuthSession } from "@/services/api/auth/auth.types";

interface SessionProviderProps {
  session: AuthSession;
  children: React.ReactNode;
}

export function SessionProvider({ session, children }: SessionProviderProps) {
  useSessionExpiryRedirect(session.actor);

  return (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  );
}
