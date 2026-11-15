import { describe, expect, it } from "vitest";

import { ApiErrorCode } from "@/enums/access/api-error-code.enum";
import { classifyError, errorReference } from "@/lib/core/errors/error-view.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const failure = (status: number, code: string, requestId?: string) => new ApiClientError({ status, code, message: "", requestId });

describe("classifyError", () => {
  it("separates maintenance, rate limit, forbidden and generic failures", () => {
    expect(classifyError(failure(503, ApiErrorCode.ServiceUnavailable))).toBe("unavailable");
    expect(classifyError(failure(502, ApiErrorCode.Server))).toBe("unavailable");
    expect(classifyError(failure(429, ApiErrorCode.TooManyRequests))).toBe("rateLimited");
    expect(classifyError(failure(403, ApiErrorCode.Forbidden))).toBe("forbidden");
    expect(classifyError(failure(500, ApiErrorCode.Server))).toBe("generic");
    expect(classifyError(new Error("boom"))).toBe("generic");
    expect(classifyError(undefined)).toBe("generic");
  });
});

describe("errorReference", () => {
  it("prefers the backend request id and falls back to the server digest", () => {
    expect(errorReference(failure(500, ApiErrorCode.Server, "req-1"))).toBe("req-1");
    expect(errorReference(failure(500, ApiErrorCode.Server))).toBeUndefined();
    expect(errorReference(Object.assign(new Error("x"), { digest: "d-42" }))).toBe("d-42");
    expect(errorReference(Object.assign(new Error("x"), { digest: "" }))).toBeUndefined();
    expect(errorReference("plain")).toBeUndefined();
  });
});
