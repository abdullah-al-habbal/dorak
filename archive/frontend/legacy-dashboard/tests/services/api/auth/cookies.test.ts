import { NextResponse } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/config/routes.constant";

afterEach(() => vi.unstubAllEnvs());

describe("applySessionCookies", () => {
  it("sets HttpOnly, SameSite=Lax, Secure production, scoped cookies", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.resetModules();
    const { applySessionCookies } = await import("@/services/api/auth/cookies");
    const response = NextResponse.json({});

    applySessionCookies(response, {
      claim: "signed-claim",
      accessToken: "access-token",
      refreshToken: "refresh-token",
      claimMaxAgeSeconds: 3600,
      refreshMaxAgeSeconds: 86_400,
    });

    const headers = response.headers.get("set-cookie") ?? "";
    expect(headers.match(/HttpOnly/gi)).toHaveLength(3);
    expect(headers.match(/SameSite=lax/gi)).toHaveLength(3);
    expect(headers.match(/Secure/gi)).toHaveLength(3);
    expect(headers.match(new RegExp(`Path=${ROUTES.home}`, "g"))).toHaveLength(
      3,
    );
  });
});
