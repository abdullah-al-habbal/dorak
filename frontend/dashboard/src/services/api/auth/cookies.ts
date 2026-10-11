import type { NextResponse } from "next/server";
import { ROUTES } from "@/config/routes.constant";
import type { SessionCookiePayload } from "@/services/api/auth/auth.types";
import { COOKIE_NAMES } from "@/services/api/auth/cookies.constant";

const baseCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: ROUTES.home,
} as const;

interface CookieReader {
  get(name: string): { value: string } | undefined;
}

/** Session cookie values from a request (`NextRequest.cookies`) or `next/headers` store. */
export function readSessionCookies(store: CookieReader) {
  return {
    claim: store.get(COOKIE_NAMES.claim)?.value,
    accessToken: store.get(COOKIE_NAMES.access)?.value,
    refreshToken: store.get(COOKIE_NAMES.refresh)?.value,
  };
}

export function applySessionCookies(
  response: NextResponse,
  payload: SessionCookiePayload,
): void {
  response.cookies.set(COOKIE_NAMES.claim, payload.claim, {
    ...baseCookieOptions,
    maxAge: payload.claimMaxAgeSeconds,
  });
  response.cookies.set(COOKIE_NAMES.access, payload.accessToken, {
    ...baseCookieOptions,
    maxAge: payload.claimMaxAgeSeconds,
  });
  response.cookies.set(COOKIE_NAMES.refresh, payload.refreshToken, {
    ...baseCookieOptions,
    maxAge: payload.refreshMaxAgeSeconds,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  for (const name of Object.values(COOKIE_NAMES)) {
    response.cookies.set(name, "", { ...baseCookieOptions, maxAge: 0 });
  }
}
