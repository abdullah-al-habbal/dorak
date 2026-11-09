import { create } from "zustand";

import { AuthStatus } from "@/enums/auth-status.enum";
import type { AuthState } from "@/interfaces/auth-state.interface";

export const useAuthStore = create<AuthState>((set) => ({
  status: AuthStatus.Unknown,
  actor: null,
  profile: null,
  setSession: (actor, profile) => set({ status: AuthStatus.Authenticated, actor, profile }),
  clearSession: () => set({ status: AuthStatus.Anonymous, actor: null, profile: null }),
  patchProfile: (patch) => set((state) => (state.profile ? { profile: { ...state.profile, ...patch } } : {})),
}));
