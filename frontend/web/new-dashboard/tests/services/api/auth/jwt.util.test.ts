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

  it("rejects an unknown role", async () => {
    expect(await verifyClaim(await signClaim({ role: "superuser" }))).toBeNull();
  });
});
