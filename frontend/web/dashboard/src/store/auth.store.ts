import { createStore } from "zustand";

import { AuthStatus } from "@/enums/access/auth-status.enum";
import type { AuthState } from "@/interfaces/core/transport/auth-state.interface";
import type { AuthStoreSeed } from "@/interfaces/core/transport/auth-store-seed.interface";
import type { AuthStoreApi } from "@/types/core/transport/auth-store-api.type";

/** One store per mounted portal, never a module singleton: a singleton seeded during SSR would leak between requests. */
export function createAuthStore(seed: AuthStoreSeed | null = null): AuthStoreApi {
  return createStore<AuthState>((set) => ({
    status: seed ? AuthStatus.Authenticated : AuthStatus.Unknown,
    actor: seed?.actor ?? null,
    profile: seed?.profile ?? null,
    setSession: (actor, profile) => set({ status: AuthStatus.Authenticated, actor, profile }),
    clearSession: () => set({ status: AuthStatus.Anonymous, actor: null, profile: null }),
    patchProfile: (patch) => set((state) => (state.profile ? { profile: { ...state.profile, ...patch } } : {})),
  }));
}
