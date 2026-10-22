import type {
  AuthActor,
  BackendActorType,
} from "@/services/api/auth/auth.types";
import { invertRecord } from "@/utils/record.util";

/** Frontend portal actors. Adding an actor here drives routes, login pages and navigation. */
export const AUTH_ACTORS = ["admin", "manager", "owner", "barber"] as const;

/** Actors that manage branch operations (overview, branches, bookings, chairs, services, stylists). */
export const OPERATIONS_ACTORS = ["admin", "manager", "owner"] as const;

export const BACKEND_ACTOR_TYPES = [
  "admin",
  "branch",
  "owner",
  "barber",
] as const;

export const DASHBOARD_ROLES = [
  "platform_admin",
  "branch_manager",
  "brand_owner",
  "barber",
] as const;

export const BACKEND_ACTOR_TYPE: Record<AuthActor, BackendActorType> = {
  admin: "admin",
  manager: "branch",
  owner: "owner",
  barber: "barber",
};

export const ACTOR_FROM_BACKEND: Record<BackendActorType, AuthActor> =
  invertRecord(BACKEND_ACTOR_TYPE);

export const DEFAULT_ACTOR: AuthActor = "admin";
