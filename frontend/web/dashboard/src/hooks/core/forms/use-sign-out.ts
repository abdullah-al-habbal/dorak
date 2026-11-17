"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/access/auth-actor.enum";
import { logoutMutation } from "@/services/api/mutation/core/logout.mutation";
import { useAuthStore } from "@/hooks/core/state/use-auth-store";

export function useSignOut(actor: AuthActor) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const [pending, setPending] = useState(false);

  const signOut = async () => {
    setPending(true);
    try {
      await logoutMutation();
    } finally {
      clearSession();
      router.replace(loginRoute(actor));
      router.refresh();
    }
  };

  return { signOut, pending };
}
