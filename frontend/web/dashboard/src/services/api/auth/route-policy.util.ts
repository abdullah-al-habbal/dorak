import { AUTH_ACTORS } from "@/config/auth-actors.constant";
import { CALLBACK_PARAM, LOGIN_SEGMENT, PUBLIC_AUTH_SEGMENTS, ROUTE_ROOT, loginRoute, portalRoot } from "@/config/routes.constant";
import type { AuthActor } from "@/enums/auth-actor.enum";
import type { RouteGuardDecision } from "@/interfaces/route-guard-decision.interface";
import type { RoutePolicyInput } from "@/interfaces/route-policy-input.interface";

export function guardFromPath(pathname: string): AuthActor | null {
  const [, root, guard] = pathname.split("/");
  return root === ROUTE_ROOT.slice(1) ? (AUTH_ACTORS.find((actor) => actor === guard) ?? null) : null;
}

export function isSafeCallback(value: string | null | undefined, actor: AuthActor): value is string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("\\") || value.includes("://")) return false;
  const root = portalRoot(actor);
  const path = value.split(/[?#]/)[0];
  const segment = path.slice(root.length + 1).split("/")[0];
  const inPortal = path === root || path.startsWith(`${root}/`);
  return inPortal && !PUBLIC_AUTH_SEGMENTS.includes(segment) && !path.endsWith(`/${LOGIN_SEGMENT}`);
}

function isUnknownGuardPath(pathname: string): boolean {
  const segment = pathname.split("/")[2];
  return Boolean(segment) && guardFromPath(pathname) === null;
}

export function decideRoute(input: RoutePolicyInput): RouteGuardDecision {
  if (isUnknownGuardPath(input.pathname)) return { kind: "not-found" };
  const guard = guardFromPath(input.pathname);
  if (!guard) return { kind: "next" };
  const segment = input.pathname.split("/")[3];
  // Forgot and reset pages open for every session state: a reset link must work on a shared device too.
  if (segment !== LOGIN_SEGMENT && PUBLIC_AUTH_SEGMENTS.includes(segment ?? "")) return { kind: "next" };
  const isLogin = segment === LOGIN_SEGMENT;

  if (!input.claimActor) {
    if (isLogin) return { kind: "next", clearCookies: input.hasSessionCookies };
    const target = `${loginRoute(guard)}?${CALLBACK_PARAM}=${encodeURIComponent(input.pathname + input.search)}`;
    return { kind: "redirect", location: target, clearCookies: true };
  }
  if (input.claimActor !== guard) return { kind: "redirect", location: portalRoot(input.claimActor) };
  if (!isLogin) return { kind: "next" };
  const callback = new URLSearchParams(input.search).get(CALLBACK_PARAM);
  return { kind: "redirect", location: isSafeCallback(callback, guard) ? callback : portalRoot(guard) };
}
