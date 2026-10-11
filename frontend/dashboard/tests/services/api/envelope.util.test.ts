import { describe, expect, it } from "vitest";
import {
  failureResponse,
  isApiResponse,
  successResponse,
} from "@/services/api/envelope.util";

describe("API envelope", () => {
  it("creates strict successful envelopes", () => {
    expect(successResponse({ id: "1" }, "Saved")).toEqual({
      success: true,
      data: { id: "1" },
      message: "Saved",
    });
  });

  it("creates strict failure envelopes", () => {
    expect(failureResponse("invalid_input", "Bad input")).toEqual({
      success: false,
      error: { code: "invalid_input", fields: undefined },
      message: "Bad input",
    });
  });

  it("rejects malformed payloads", () => {
    expect(isApiResponse({ ok: true })).toBe(false);
  });
});
