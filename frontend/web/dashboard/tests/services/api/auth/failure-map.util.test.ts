import { describe, expect, it } from "vitest";

import { ApiErrorCode } from "@/enums/api-error-code.enum";
import type { BackendResult } from "@/interfaces/backend-result.interface";
import { mapBackendFailure } from "@/services/api/auth/failure-map.util";

function result(status: number, code = "X", failure: BackendResult["failure"] = "none"): BackendResult {
  return {
    ok: false,
    status,
    failure,
    envelope: { success: false, statusCode: status, code, message: "", timestamp: "" },
  };
}

describe("mapBackendFailure", () => {
  it("maps transport, auth, ban, throttle and validation failures", () => {
    expect(mapBackendFailure(result(0, "X", "transport")).code).toBe(ApiErrorCode.Network);
    expect(mapBackendFailure(result(401)).code).toBe(ApiErrorCode.InvalidCredentials);
    expect(mapBackendFailure(result(403, "ACCOUNT_BANNED")).code).toBe(ApiErrorCode.AccountBanned);
    expect(mapBackendFailure(result(429)).code).toBe(ApiErrorCode.TooManyRequests);
    expect(mapBackendFailure(result(422)).code).toBe(ApiErrorCode.InvalidRequest);
    expect(mapBackendFailure(result(500)).code).toBe(ApiErrorCode.Server);
    expect(mapBackendFailure(result(302, "X", "redirect")).status).toBe(502);
  });
});
