import type { AuthActor } from "@/enums/auth-actor.enum";
import type { AuthStatus } from "@/enums/auth-status.enum";
import type { MeProfile } from "@/types/me-profile.type";

export interface AuthState {
  status: AuthStatus;
  actor: AuthActor | null;
  profile: MeProfile | null;
  setSession: (actor: AuthActor, profile: MeProfile) => void;
  clearSession: () => void;
  /** Applies an account-page change (name or confirmed email) to the header without a reload. */
  patchProfile: (patch: Partial<Pick<MeProfile, "display_name" | "email">>) => void;
}
