import { describe, expect, it } from "vitest";

import { HttpStatus } from "@/enums/access/http-status.enum";
import { bookingStatusErrorMessage } from "@/lib/bookings/booking-status-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const MESSAGES = { conflict: "conflict", invalid: "invalid", failed: "failed" };

function failure(status: number): ApiClientError {
  return new ApiClientError({ status, code: "x", message: "backend reason" });
}

describe("bookingStatusErrorMessage", () => {
  it("maps a 409 to the conflict copy", () => {
    expect(bookingStatusErrorMessage(failure(HttpStatus.Conflict), MESSAGES)).toBe("conflict");
  });

  it("maps a 400 to the invalid-transition copy", () => {
    expect(bookingStatusErrorMessage(failure(HttpStatus.BadRequest), MESSAGES)).toBe("invalid");
  });

  it("uses the generic copy for any other status", () => {
    expect(bookingStatusErrorMessage(failure(HttpStatus.Unprocessable), MESSAGES)).toBe("failed");
  });

  it("uses the generic copy for errors that are not API errors", () => {
    expect(bookingStatusErrorMessage(new Error("network"), MESSAGES)).toBe("failed");
  });
});
