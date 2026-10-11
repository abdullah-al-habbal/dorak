import { ROUTES } from "@/config/routes.constant";
import { isPathWithin } from "@/config/routes.util";
import {
  AUTH_ACTORS,
  DEFAULT_ACTOR,
} from "@/services/api/auth/actors.constant";
import type { AuthActor } from "@/services/api/auth/auth.types";
import { isOneOf } from "@/utils/guards.util";

function segments(pathname: string): string[] {
  return pathname.split(ROUTES.home).filter(Boolean);
}

export function isAuthActor(value: unknown): value is AuthActor {
  return isOneOf(AUTH_ACTORS, value);
}

export function isPublicPath(pathname: string): boolean {
  return pathname === ROUTES.home || pathname === ROUTES.forbidden;
}

export function loginActorFromPath(pathname: string): AuthActor | null {
  const parts = segments(pathname);
  if (parts.length === 2 && parts[1] === "login" && isAuthActor(parts[0])) {
    return parts[0];
  }

  return null;
}

export function portalActorFromPath(pathname: string): AuthActor | null {
  const parts = segments(pathname);
  if (parts.length >= 1 && isAuthActor(parts[0]) && parts[1] !== "login") {
    return parts[0];
  }

  return null;
}

export function isProtectedPath(pathname: string): boolean {
  return portalActorFromPath(pathname) !== null;
}

export function redirectTargetForPath(pathname: string): AuthActor {
  return portalActorFromPath(pathname) ?? DEFAULT_ACTOR;
}

export function isSafeCallback(
  callbackUrl: string | null | undefined,
  actor: AuthActor,
): callbackUrl is string {
  if (
    !callbackUrl ||
    !callbackUrl.startsWith(ROUTES.home) ||
    callbackUrl.startsWith(`${ROUTES.home}${ROUTES.home}`)
  ) {
    return false;
  }

  if (callbackUrl.includes("\\") || callbackUrl.includes("://")) {
    return false;
  }

  return isPathWithin(callbackUrl, ROUTES.portal[actor].root);
}
