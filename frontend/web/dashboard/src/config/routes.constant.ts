import type { AuthActor } from "@/enums/access/auth-actor.enum";

export const ROUTE_ROOT = "/dashboard";
export const LOGIN_SEGMENT = "login";
const FORGOT_PASSWORD_SEGMENT = "forgot-password";
const RESET_PASSWORD_SEGMENT = "reset-password";
export const ACCOUNT_SEGMENT = "account";
export const NOTIFICATIONS_SEGMENT = "notifications";
/** Pages under a guard that a signed-out visitor may open. */
export const PUBLIC_AUTH_SEGMENTS: readonly string[] = [LOGIN_SEGMENT, FORGOT_PASSWORD_SEGMENT, RESET_PASSWORD_SEGMENT];
/** Set on the login URL after a successful password reset, so the page confirms it. */
export const RESET_DONE_PARAM = "reset";
export const RESET_DONE_VALUE = "1";
/** Query names in the emailed reset link, as the backend builds it. */
export const RESET_LINK_TOKEN_PARAM = "token";
export const RESET_LINK_EMAIL_PARAM = "email";
export const CALLBACK_PARAM = "callbackUrl";

/** The owner portal page that shows how the review of a new brand is going. */
export const STATUS_SEGMENT = "status";

export const API_ROUTE = {
  login: "/api/auth/login",
  refresh: "/api/auth/refresh",
  logout: "/api/auth/logout",
  me: "/api/auth/me",
  passwordForgot: "/api/auth/password/forgot",
  passwordReset: "/api/auth/password/reset",
  passwordChange: "/api/auth/password/change",
  registerBusiness: "/api/auth/register/business",
  registerVerify: "/api/auth/register/verify",
  registerResend: "/api/auth/register/resend",
  registerExisting: "/api/auth/register/existing",
} as const;

/** Backend dashboard paths are used as-is behind this prefix; there is no renaming. */
export const DASHBOARD_API = "/api/dashboard";

export function portalRoot(actor: AuthActor): string {
  return `${ROUTE_ROOT}/${actor}`;
}

export function loginRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${LOGIN_SEGMENT}`;
}

export function forgotPasswordRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${FORGOT_PASSWORD_SEGMENT}`;
}

export function resetDoneLoginRoute(actor: AuthActor): string {
  return `${loginRoute(actor)}?${RESET_DONE_PARAM}=${RESET_DONE_VALUE}`;
}

export function statusRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${STATUS_SEGMENT}`;
}

export function accountRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${ACCOUNT_SEGMENT}`;
}

export function notificationsRoute(actor: AuthActor): string {
  return `${portalRoot(actor)}/${NOTIFICATIONS_SEGMENT}`;
}

/** Next's internal not-found route: a proxy rewrite to it answers a real HTTP 404 with the 404 screen. */
export const NOT_FOUND_ROUTE = "/_not-found";
