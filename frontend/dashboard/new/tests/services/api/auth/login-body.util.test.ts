import { describe, expect, it } from "vitest";
import { parseLoginBody } from "@/services/api/auth/login-body.util";

describe("parseLoginBody", () => {
  it("returns typed credentials for a valid payload", () => {
    expect(parseLoginBody({ actor: "manager", email: "a@b.c", password: "secret", extra: 1 })).toEqual({
      actor: "manager",
      email: "a@b.c",
      password: "secret",
    });
  });

  it.each([
    null,
    "string",
    {},
    { actor: "owner", email: "a@b.c", password: "x" },
    { actor: "admin", email: 1, password: "x" },
    { actor: "admin", email: "a@b.c" },
  ])("rejects malformed payload %j", (payload) => {
    expect(parseLoginBody(payload)).toBeNull();
  });
});
