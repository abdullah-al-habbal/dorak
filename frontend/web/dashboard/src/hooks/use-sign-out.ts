"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { loginRoute } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { logoutMutation } from "@/services/api/mutation/logout.mutation";
import { useAuthStore } from "@/store/auth.store";

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
