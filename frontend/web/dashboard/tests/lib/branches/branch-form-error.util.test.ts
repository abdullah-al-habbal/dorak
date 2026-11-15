import { describe, expect, it } from "vitest";

import { mapBranchSaveError } from "@/lib/branches/branch-form-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const messages = { generic: "generic", planLimit: "plan limit" };

describe("mapBranchSaveError", () => {
  it("explains a plan restriction on 403", () => {
    const error = new ApiClientError({ status: 403, code: "forbidden", message: "Forbidden" });
    expect(mapBranchSaveError(error, messages)).toEqual({ fieldErrors: {}, formError: "plan limit" });
  });

  it("shows the backend's own reason on 409, for example the last active branch", () => {
    const error = new ApiClientError({ status: 409, code: "conflict", message: "A brand must keep at least one active branch." });
    expect(mapBranchSaveError(error, messages).formError).toBe("A brand must keep at least one active branch.");
  });

  it("maps dotted validation names to form field names", () => {
    const error = new ApiClientError({ status: 422, code: "invalid_request", message: "x", fields: { "description.en": ["Too long"], email: ["Taken"] } });
    expect(mapBranchSaveError(error, messages).fieldErrors).toEqual({ description_en: "Too long", email: "Taken" });
  });

  it("falls back to the generic message for anything else", () => {
    expect(mapBranchSaveError(new Error("boom"), messages)).toEqual({ fieldErrors: {}, formError: "generic" });
  });
});
