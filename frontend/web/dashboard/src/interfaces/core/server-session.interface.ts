import type { AuthActor } from "@/enums/auth-actor.enum";
import type { MeProfile } from "@/types/account/me-profile.type";

export interface ServerSession {
  actor: AuthActor;
  profile: MeProfile;
}
