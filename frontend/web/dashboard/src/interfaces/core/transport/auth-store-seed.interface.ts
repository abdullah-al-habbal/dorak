import type { AuthActor } from "@/enums/access/auth-actor.enum";
import type { MeProfile } from "@/types/account/profile/me-profile.type";

export interface AuthStoreSeed {
  actor: AuthActor;
  profile: MeProfile;
}
