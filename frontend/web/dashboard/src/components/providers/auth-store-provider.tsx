"use client";

import { useEffect, useState } from "react";
import type { JSX } from "react";

import { AuthStoreContext } from "@/components/providers/auth-store-context";
import type { AuthStoreProviderProps } from "@/interfaces/ui/shell/auth-store-provider-props.interface";
import { createAuthStore } from "@/store/auth.store";

/** Seeds the session store with the server-verified profile before the first render, so SSR and hydration see it. */
export function AuthStoreProvider({ actor, profile, children }: AuthStoreProviderProps): JSX.Element {
  const [store] = useState(() => createAuthStore({ actor, profile }));

  // A later server render (for example after `router.refresh()`) can carry a newer profile.
  useEffect(() => {
    if (store.getState().profile !== profile) store.getState().setSession(actor, profile);
  }, [store, actor, profile]);

  return <AuthStoreContext value={store}>{children}</AuthStoreContext>;
}
