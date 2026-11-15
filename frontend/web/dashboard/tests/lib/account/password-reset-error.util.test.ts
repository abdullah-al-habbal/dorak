import { describe, expect, it } from "vitest";

import { isInvalidResetLink, isTooManyRequests } from "@/lib/account/password-reset-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

describe("password reset errors", () => {
  it("treats a token field error as an unusable link", () => {
    expect(isInvalidResetLink(new ApiClientError({ status: 400, code: "invalid_request", message: "m", fields: { token: ["x"] } }))).toBe(true);
    expect(isInvalidResetLink(new ApiClientError({ status: 400, code: "invalid_request", message: "m", fields: { password: ["x"] } }))).toBe(false);
    expect(isInvalidResetLink(new Error("network"))).toBe(false);
  });

  it("recognises the rate limit", () => {
    expect(isTooManyRequests(new ApiClientError({ status: 429, code: "too_many_requests", message: "m" }))).toBe(true);
    expect(isTooManyRequests(new ApiClientError({ status: 500, code: "server_error", message: "m" }))).toBe(false);
  });
});
