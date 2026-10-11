"use client";

import { SessionContext } from "@/components/auth/session-context";
import { useRequiredContext } from "@/hooks/use-required-context";
import type { AuthSession } from "@/services/api/auth/auth.types";

/** Validated portal session. Portal layouts guarantee it; anywhere else is a wiring bug. */
export function useSession(): AuthSession {
  return useRequiredContext(SessionContext, "useSession");
}
