import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sessionFromBackendLoginData } from "@/services/api/auth/session.util";
import type {
  BackendLoginData,
  DashboardClaim,
} from "@/services/api/auth/auth.types";

const SECRET =
  "dashboard-session-secret-that-is-at-least-thirty-two-characters";

function sign(claim: DashboardClaim): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const payload = Buffer.from(JSON.stringify(claim)).toString("base64url");
  const signature = createHmac("sha256", SECRET)
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

function credentials(
  overrides: Partial<BackendLoginData> = {},
): BackendLoginData {
  const now = Math.floor(Date.now() / 1000);
  return {
    claim: sign({
      actor_type: "admin",
      role: "platform_admin",
      sub: "actor-1",
      iat: now,
      exp: now + 3600,
      iss: "dorak-backend",
    }),
    token: "access-token",
    refresh_token: "refresh-token",
    expires_in: 3600,
    refresh_expires_in: 86_400,
    ...overrides,
  };
}

afterEach(() => vi.unstubAllEnvs());

describe("sessionFromBackendLoginData", () => {
  it("accepts signed backend credentials and creates cookie payload", async () => {
    vi.stubEnv("DASHBOARD_SESSION_SECRET", SECRET);

    await expect(
      sessionFromBackendLoginData(credentials()),
    ).resolves.toMatchObject({
      claim: { actor_type: "admin", sub: "actor-1" },
      cookies: { accessToken: "access-token", refreshToken: "refresh-token" },
    });
  });

  it("fails closed for invalid credential payloads", async () => {
    vi.stubEnv("DASHBOARD_SESSION_SECRET", SECRET);

    await expect(
      sessionFromBackendLoginData(credentials({ expires_in: 0 })),
    ).resolves.toBeNull();
    await expect(
      sessionFromBackendLoginData(credentials({ claim: "invalid" })),
    ).resolves.toBeNull();
  });
});
