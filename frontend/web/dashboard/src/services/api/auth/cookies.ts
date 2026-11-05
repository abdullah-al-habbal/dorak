import type { NextResponse } from "next/server";

import { ACCESS_COOKIE, CLAIM_COOKIE, REFRESH_COOKIE } from "@/config/cookies.constant";
import type { SessionTokens } from "@/interfaces/session-tokens.interface";

function baseOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export function setSessionCookies(response: NextResponse, tokens: SessionTokens): void {
  response.cookies.set(CLAIM_COOKIE, tokens.claim, baseOptions(tokens.claimMaxAge));
  response.cookies.set(ACCESS_COOKIE, tokens.accessToken, baseOptions(tokens.claimMaxAge));
  response.cookies.set(REFRESH_COOKIE, tokens.refreshToken, baseOptions(tokens.refreshMaxAge));
}

export function clearSessionCookies(response: NextResponse): void {
  for (const name of [CLAIM_COOKIE, ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set(name, "", { ...baseOptions(0), maxAge: 0 });
  }
}
