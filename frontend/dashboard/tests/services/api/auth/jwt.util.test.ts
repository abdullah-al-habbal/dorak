import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  isClaimExpired,
  peekDashboardClaim,
  verifyDashboardClaim,
} from "@/services/api/auth/jwt.util";
import type { DashboardClaim } from "@/services/api/auth/auth.types";

const SECRET =
  "dashboard-session-secret-that-is-at-least-thirty-two-characters";

function base64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(claim: DashboardClaim, secret = SECRET): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = base64Url(JSON.stringify(claim));
  const signature = createHmac("sha256", secret)
    .update(`${header}.${payload}`)
    .digest();

  return `${header}.${payload}.${base64Url(signature)}`;
}

function makeClaim(overrides: Partial<DashboardClaim> = {}): DashboardClaim {
  const now = Math.floor(Date.now() / 1000);

  return {
    actor_type: "admin",
    role: "platform_admin",
    sub: "actor-1",
    iat: now,
    exp: now + 3600,
    iss: "dorak-backend",
    ...overrides,
  };
}

describe("verifyDashboardClaim", () => {
  it("accepts a validly signed, unexpired claim", async () => {
    const claim = makeClaim();

    await expect(
      verifyDashboardClaim(sign(claim), SECRET),
    ).resolves.toMatchObject({
      actor_type: "admin",
      sub: "actor-1",
    });
  });

  it("rejects a token signed with a different secret", async () => {
    const claim = makeClaim();

    await expect(
      verifyDashboardClaim(
        sign(claim, "another-secret-that-is-long-enough-000"),
        SECRET,
      ),
    ).resolves.toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = sign(makeClaim());
    const [header, , signature] = token.split(".");
    const tampered = base64Url(JSON.stringify(makeClaim({ role: "barber" })));

    await expect(
      verifyDashboardClaim(`${header}.${tampered}.${signature}`, SECRET),
    ).resolves.toBeNull();
  });

  it("rejects claims that do not match the backend issuer or actor contract", async () => {
    await expect(
      verifyDashboardClaim(sign(makeClaim({ iss: "another-issuer" })), SECRET),
    ).resolves.toBeNull();
    await expect(
      verifyDashboardClaim(
        sign(makeClaim({ actor_type: "branch", branch_id: "branch-1" })),
        SECRET,
      ),
    ).resolves.toBeNull();
  });

  it("rejects an expired claim", async () => {
    const expired = makeClaim({ exp: Math.floor(Date.now() / 1000) - 10 });

    await expect(
      verifyDashboardClaim(sign(expired), SECRET),
    ).resolves.toBeNull();
  });

  it("rejects when the shared secret is too short", async () => {
    await expect(
      verifyDashboardClaim(sign(makeClaim()), "short"),
    ).resolves.toBeNull();
  });
});

describe("peekDashboardClaim", () => {
  it("decodes the payload without verifying the signature", () => {
    const claim = makeClaim({
      actor_type: "branch",
      role: "branch_manager",
      branch_id: "branch-1",
    });

    expect(
      peekDashboardClaim(sign(claim, "wrong-secret-value-1234567890")),
    ).toMatchObject({
      actor_type: "branch",
      branch_id: "branch-1",
    });
  });

  it("returns null for malformed tokens", () => {
    expect(peekDashboardClaim("not-a-jwt")).toBeNull();
  });
});

describe("isClaimExpired", () => {
  it("compares against the provided clock", () => {
    const now = 1_000_000;

    expect(isClaimExpired(makeClaim({ exp: 900 }), now)).toBe(true);
    expect(isClaimExpired(makeClaim({ exp: 1100 }), now)).toBe(false);
  });
});
