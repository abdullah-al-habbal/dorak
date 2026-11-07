import { describe, expect, it } from "vitest";

import { mapApiFormError } from "@/lib/map-api-form-error.util";
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
