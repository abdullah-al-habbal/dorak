export const BACKEND_DASHBOARD_PREFIX = "/api/v1/dashboard";
export const BACKEND_TIMEOUT_MS = 15_000;
export const BACKEND_DEFAULT_URL = "http://localhost:8000";
export const CLAIM_HEADER = "X-Dashboard-Session";
/** Carries the visitor's IP to Laravel, which trusts it only from the dashboard server. */
export const FORWARDED_FOR_HEADER = "X-Forwarded-For";
export const CLAIM_ISSUER = "dorak-backend";
export const MIN_SECRET_LENGTH = 32;
export const DEFAULT_KEY_ID = "default";
export const SECONDS_PER_YEAR = 31_536_000;

export const BACKEND_PATH = {
  login: "/login",
  refresh: "/refresh",
  logout: "/logout",
  me: "/me",
  passwordForgot: "/password/forgot",
  passwordReset: "/password/reset",
  passwordChange: "/profile/password",
} as const;
