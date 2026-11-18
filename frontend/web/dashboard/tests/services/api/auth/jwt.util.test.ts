import { describe, expect, it } from "vitest";

import { signClaim } from "@tests/helpers/claim.helper";
import { verifyClaim } from "@/services/api/auth/jwt.util";

describe("verifyClaim", () => {
  it("accepts a valid claim", async () => {
    const claim = await verifyClaim(await signClaim());
    expect(claim?.actor_type).toBe("branch");
    expect(claim?.branch_id).toBe("3");
  });

  it("rejects a wrong signature, expiry, issuer and malformed input", async () => {
    const past = Math.floor(Date.now() / 1000) - 10;
    expect(await verifyClaim(await signClaim({}, "another-secret-another-secret-0123456789"))).toBeNull();
    expect(await verifyClaim(await signClaim({ iat: past - 100, exp: past }))).toBeNull();
    expect(await verifyClaim(await signClaim({ iss: "someone-else" }))).toBeNull();
    expect(await verifyClaim("not.a.jwt")).toBeNull();
    expect(await verifyClaim(undefined)).toBeNull();
  });

  it("exposes the access-token id the claim is bound to", async () => {
    expect((await verifyClaim(await signClaim({ tid: "42" })))?.tid).toBe("42");
  });

  it("rejects a legacy claim without tid, an empty tid and a numeric tid", async () => {
    expect(await verifyClaim(await signClaim({ tid: undefined }))).toBeNull();
    expect(await verifyClaim(await signClaim({ tid: "" }))).toBeNull();
    expect(await verifyClaim(await signClaim({ tid: 10 }))).toBeNull();
  });

  it("rejects an unknown role", async () => {
    expect(await verifyClaim(await signClaim({ role: "superuser" }))).toBeNull();
  });

  it("never resolves a key id to an inherited property of the key ring", async () => {
    // `constructor` is an inherited property, so an unguarded lookup would sign with String(Object) as the secret.
    const forged = await signClaim({}, String(Object), "constructor");
    expect(await verifyClaim(forged)).toBeNull();
  });
});
