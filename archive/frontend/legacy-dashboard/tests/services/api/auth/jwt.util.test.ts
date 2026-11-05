import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  isClaimExpired,
  peekDashboardClaim,
  verifyDashboardClaim,
} from "@/services/api/auth/jwt.util";
import type { DashboardClaim } from "@/services/api/auth/types/auth.types";

const SECRET =
  "dashboard-session-secret-that-is-at-least-thirty-two-characters";

function base64Url(value: Buffer | string): string {
  return Buffer.from(value).toString("base64url");
}

function sign(claim: DashboardClaim, secret = SECRET, kid = "default"): string {
  const header = base64Url(JSON.stringify({ alg: "HS256", kid, typ: "JWT" }));
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
    jti: "jti-1",
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

  it("accepts claims signed by active or retained rotation keys", async () => {
    const previous = "previous-dashboard-session-secret-at-least-32";
    const active = "active-dashboard-session-secret-at-least-32-characters";
    const keys = { old: previous, new: active };

    await expect(
      verifyDashboardClaim(sign(makeClaim(), previous, "old"), keys),
    ).resolves.toMatchObject({ jti: "jti-1" });
    await expect(
      verifyDashboardClaim(sign(makeClaim(), previous, "old"), { new: active }),
    ).resolves.toBeNull();
    await expect(
      verifyDashboardClaim(sign(makeClaim(), active, "new"), keys),
    ).resolves.toMatchObject({ jti: "jti-1" });
  });
});

describe("brand owner claims", () => {
  const ownerClaim = (overrides: Partial<DashboardClaim> = {}) =>
    makeClaim({
      actor_type: "owner",
      role: "brand_owner",
      brand_id: "brand-1",
      brand_ids: ["brand-1", "brand-2"],
      ...overrides,
    });

  it("accepts an owner claim carrying its brand ids", async () => {
    await expect(
      verifyDashboardClaim(sign(ownerClaim()), SECRET),
    ).resolves.toMatchObject({
      actor_type: "owner",
      brand_ids: ["brand-1", "brand-2"],
    });
  });

  it.each([
    ["no brands", { brand_ids: [] }],
    ["a primary brand outside the list", { brand_id: "brand-9" }],
    ["a branch scope", { branch_id: "branch-1" }],
    ["the wrong role", { role: "branch_manager" as const }],
  ])("rejects an owner claim with %s", async (_label, overrides) => {
    await expect(
      verifyDashboardClaim(sign(ownerClaim(overrides)), SECRET),
    ).resolves.toBeNull();
  });

  it("rejects brand ids on a non-owner claim", async () => {
    await expect(
      verifyDashboardClaim(sign(makeClaim({ brand_ids: ["brand-1"] })), SECRET),
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
