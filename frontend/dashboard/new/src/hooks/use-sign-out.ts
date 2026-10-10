"use client";

import { ROUTES } from "@/config/routes.constant";
import { useReplaceAndRefresh } from "@/hooks/use-replace-and-refresh";
import { useSignOutMutation } from "@/hooks/use-sign-out-mutation";
import type { AuthActor } from "@/services/api/auth/auth.types";

export function useSignOut(actor: AuthActor) {
  const navigate = useReplaceAndRefresh();
  const signOut = useSignOutMutation();

  function signOutAndRedirect() {
    signOut.mutate(undefined, { onSettled: () => navigate(ROUTES.portal[actor].login) });
  }

  return { isPending: signOut.isPending, signOut: signOutAndRedirect };
}
