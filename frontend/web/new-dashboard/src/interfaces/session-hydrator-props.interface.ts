import type { AuthActor } from "@/enums/auth-actor.enum";
import type { MeProfile } from "@/types/me-profile.type";

export interface SessionHydratorProps {
  actor: AuthActor;
  profile: MeProfile;
  sidebarCollapsed: boolean;
}
