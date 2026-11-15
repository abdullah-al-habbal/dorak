import type { AuthActor } from "@/enums/access/auth-actor.enum";

export interface RoutePolicyInput {
  pathname: string;
  search: string;
  claimActor: AuthActor | null;
  hasSessionCookies: boolean;
}
