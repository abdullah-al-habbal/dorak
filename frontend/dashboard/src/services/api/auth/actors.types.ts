import type {
  AUTH_ACTORS,
  OPERATIONS_ACTORS,
  BACKEND_ACTOR_TYPES,
  DASHBOARD_ROLES,
} from "@/services/api/auth/actors.constant";

export type AuthActor = (typeof AUTH_ACTORS)[number];
export type OperationsActor = (typeof OPERATIONS_ACTORS)[number];
export type BackendActorType = (typeof BACKEND_ACTOR_TYPES)[number];
export type DashboardRole = (typeof DASHBOARD_ROLES)[number];
