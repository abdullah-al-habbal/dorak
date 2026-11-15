import { describe, expect, it } from "vitest";

import { HttpStatus } from "@/enums/http-status.enum";
import { mapApiFieldErrors } from "@/lib/core/api-field-errors.util";
import { formErrorMessage, mapApiFormError } from "@/lib/core/map-api-form-error.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const validation = (fields: Record<string, string[]>): ApiClientError => new ApiClientError({ status: 422, code: "invalid_request", message: "x", fields });

describe("mapApiFormError", () => {
  it("returns the base mapping unchanged without a field-name mapper", () => {
    const error = validation({ "name.ar": ["required"], "items.0": ["bad"], email: ["taken"] });
    expect(mapApiFormError(error, "generic")).toEqual({ fieldErrors: { name_ar: "required", items: "bad", email: "taken" } });
  });

  it("renames each field after the base mapping has run", () => {
    const error = validation({ "description.en": ["Too long"], "name.en": ["Required"], "tags.1": ["Unknown"] });
    const seen: string[] = [];
    const mapped = mapApiFormError(error, "generic", (name) => {
      seen.push(name);
      return name.replace(/\./g, "_");
    });
    expect(seen).toEqual(["description.en", "name_en", "tags"]);
    expect(mapped).toEqual({ fieldErrors: { description_en: "Too long", name_en: "Required", tags: "Unknown" } });
  });

  it("keeps the form-level message and never calls the mapper when no field owns the error", () => {
    let calls = 0;
    const mapper = (name: string): string => {
      calls += 1;
      return name;
    };
    expect(mapApiFormError(new Error("boom"), "generic", mapper)).toEqual({ fieldErrors: {}, formError: "generic" });
    expect(mapApiFormError(new ApiClientError({ status: 500, code: "server_error", message: "" }), "generic", mapper)).toEqual({ fieldErrors: {}, formError: "generic" });
    expect(mapApiFormError(validation({ email: [] }), "generic", mapper)).toEqual({ fieldErrors: {}, formError: "generic" });
    expect(calls).toBe(0);
  });

  it("lets a later field win when two backend names map to the same form field", () => {
    const error = validation({ "tags.0": ["first"], "tags.1": ["second"] });
    expect(mapApiFormError(error, "generic", (name) => name).fieldErrors).toEqual({ tags: "second" });
  });
});

const GENERIC = "Something went wrong.";

/** The inline logic both forms used before the helper. */
function inlineMessage(error: unknown): string | undefined {
  const mapped = mapApiFieldErrors(error, GENERIC);
  return Object.values(mapped.fieldErrors)[0] ?? mapped.formError;
}

describe("formErrorMessage", () => {
  it("returns the first field message of a validation failure", () => {
    const error = validation({ "name.en": ["English name is required."], "name.ar": ["Arabic name is required."] });
    expect(formErrorMessage(error, GENERIC)).toBe("English name is required.");
  });

  it("returns the generic message when no field owns the failure", () => {
    expect(formErrorMessage(new ApiClientError({ status: HttpStatus.Conflict, code: "x", message: "busy" }), GENERIC)).toBe(GENERIC);
    expect(formErrorMessage(new Error("network"), GENERIC)).toBe(GENERIC);
    expect(formErrorMessage(validation({}), GENERIC)).toBe(GENERIC);
  });

  it("matches the inline mapping it replaces for every failure shape", () => {
    const failures: unknown[] = [
      validation({ "days.0": ["Shifts overlap."] }),
      validation({ "name.ar": ["Too long."], other: ["Bad."] }),
      validation({}),
      new ApiClientError({ status: HttpStatus.Forbidden, code: "x", message: "no" }),
      new Error("network"),
      undefined,
    ];
    for (const failure of failures) expect(formErrorMessage(failure, GENERIC)).toBe(inlineMessage(failure));
  });
});
