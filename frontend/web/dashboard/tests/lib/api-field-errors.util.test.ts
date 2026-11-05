import { describe, expect, it } from "vitest";

import { mapApiFieldErrors } from "@/lib/api-field-errors.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

describe("mapApiFieldErrors", () => {
  it("maps backend field errors and renames name.* to name_*", () => {
    const error = new ApiClientError({ status: 422, code: "validation_error", message: "x", fields: { email: ["taken"], "name.ar": ["required"] } });
    expect(mapApiFieldErrors(error, "generic").fieldErrors).toEqual({ email: "taken", name_ar: "required" });
  });

  it("falls back to a form message for other failures", () => {
    expect(mapApiFieldErrors(new ApiClientError({ status: 500, code: "server_error", message: "" }), "generic")).toEqual({ fieldErrors: {}, formError: "generic" });
  });
});
