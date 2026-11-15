import { describe, expect, it } from "vitest";

import { HttpStatus } from "@/enums/access/http-status.enum";
import { conflictMessage } from "@/lib/core/errors/conflict-message.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const FALLBACK = "Could not delete.";

function failure(status: number, message: string): ApiClientError {
  return new ApiClientError({ status, code: "x", message });
}

describe("conflictMessage", () => {
  it("returns the backend reason for a 409", () => {
    expect(conflictMessage(failure(HttpStatus.Conflict, "Has live subscriptions"), FALLBACK)).toBe("Has live subscriptions");
  });

  it("falls back when the 409 has no message", () => {
    expect(conflictMessage(failure(HttpStatus.Conflict, ""), FALLBACK)).toBe(FALLBACK);
  });

  it("falls back for other statuses and non-API errors", () => {
    expect(conflictMessage(failure(HttpStatus.Forbidden, "No"), FALLBACK)).toBe(FALLBACK);
    expect(conflictMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK);
  });
});
