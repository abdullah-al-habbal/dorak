import { describe, expect, it } from "vitest";
import { ApiClientError } from "@/services/api/client-error";
import {
  isAuthorizationError,
  isRetryableApiError,
  isServiceUnavailableError,
} from "@/services/api/client-error.util";

describe("isAuthorizationError", () => {
  it.each([401, 403])("recognises status %d", (status) => {
    expect(isAuthorizationError(new ApiClientError("Denied", status))).toBe(
      true,
    );
  });

  it("does not classify network and server failures as authorization failures", () => {
    expect(isAuthorizationError(new ApiClientError("Offline", 0))).toBe(false);
    expect(isAuthorizationError(new ApiClientError("Unavailable", 503))).toBe(
      false,
    );
  });

  it("retries only transient HTTP failures", () => {
    expect(isRetryableApiError(new ApiClientError("Timeout", 408))).toBe(true);
    expect(isRetryableApiError(new ApiClientError("Server", 503))).toBe(true);
    expect(isRetryableApiError(new ApiClientError("Invalid", 422))).toBe(false);
  });
});

describe("isServiceUnavailableError", () => {
  it("flags transport and 5xx failures only", () => {
    expect(
      isServiceUnavailableError(
        new ApiClientError("Down", 0, undefined, undefined, "unreachable"),
      ),
    ).toBe(true);
    expect(isServiceUnavailableError(new ApiClientError("Server", 502))).toBe(
      true,
    );
    expect(isServiceUnavailableError(new ApiClientError("Invalid", 422))).toBe(
      false,
    );
    expect(isServiceUnavailableError(new Error("plain"))).toBe(false);
  });
});
