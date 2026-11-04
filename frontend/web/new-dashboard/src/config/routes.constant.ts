import type { AuthActor } from "@/enums/auth-actor.enum";

export const ROUTE_ROOT = "/dashboard";
export const HOME_ROUTE = "/";
export const FORBIDDEN_SEGMENT = "forbidden";
export const LOGIN_SEGMENT = "login";
export const CALLBACK_PARAM = "callbackUrl";

export const API_ROUTE = {
  login: "/api/auth/login",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
} as const;

/** Backend dashboard paths are used as-is behind this prefix; there is no renaming. */
export const DASHBOARD_API = "/api/dashboard";

export function portalRoot(actor: AuthActor): string {
  return `${ROUTE_ROOT}/${actor}`;
}

export function loginRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${LOGIN_SEGMENT}`;
}

export function forbiddenRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${FORBIDDEN_SEGMENT}`;
}
