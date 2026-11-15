import { describe, expect, it } from "vitest";

import { hasApiFieldErrors, mapApiFieldErrors } from "@/lib/core/errors/api-field-errors.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

describe("mapApiFieldErrors", () => {
  it("maps backend field errors and renames name.* to name_*", () => {
    const error = new ApiClientError({ status: 422, code: "validation_error", message: "x", fields: { email: ["taken"], "name.ar": ["required"] } });
    expect(mapApiFieldErrors(error, "generic").fieldErrors).toEqual({ email: "taken", name_ar: "required" });
  });

  it("reads the field errors the proxy forwards as a 400", () => {
    const error = new ApiClientError({ status: 400, code: "invalid_request", message: "x", fields: { "name.en": ["The name.en has already been taken."] } });
    expect(hasApiFieldErrors(error)).toBe(true);
    expect(mapApiFieldErrors(error, "generic").fieldErrors).toEqual({ name_en: "The name.en has already been taken." });
  });

  it("keeps a 400 without fields as a form-level failure", () => {
    const error = new ApiClientError({ status: 400, code: "invalid_request", message: "business rule" });
    expect(hasApiFieldErrors(error)).toBe(false);
    expect(mapApiFieldErrors(error, "generic")).toEqual({ fieldErrors: {}, formError: "generic" });
  });

  it("falls back to a form message for other failures", () => {
    expect(mapApiFieldErrors(new ApiClientError({ status: 500, code: "server_error", message: "" }), "generic")).toEqual({ fieldErrors: {}, formError: "generic" });
  });
});
