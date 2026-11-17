import type { AuthActor } from "@/enums/access/auth-actor.enum";

export interface SessionHydratorProps {
  actor: AuthActor;
}
