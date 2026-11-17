import { useContext } from "react";
import { useStore } from "zustand";

import { AuthStoreContext } from "@/components/providers/auth-store-context";
import type { AuthState } from "@/interfaces/core/transport/auth-state.interface";

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);
  if (!store) throw new Error("useAuthStore must be used inside AuthStoreProvider");
  return useStore(store, selector);
}
