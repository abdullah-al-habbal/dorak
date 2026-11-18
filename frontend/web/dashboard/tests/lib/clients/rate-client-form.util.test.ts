import { describe, expect, it } from "vitest";

import { formToRatingInput, mapRatingFieldName } from "@/lib/clients/rate-client-form.util";

describe("rate client mapping", () => {
  it("leaves a blank note out", () => {
    expect(formToRatingInput({ rating: 4, body: "  " })).toEqual({ rating: 4 });
  });

  it("trims the note", () => {
    expect(formToRatingInput({ rating: 5, body: " Punctual " })).toEqual({ rating: 5, body: "Punctual" });
  });

  it("maps backend field names onto form fields", () => {
    expect(mapRatingFieldName("rating")).toBe("rating");
    expect(mapRatingFieldName("body")).toBe("body");
    expect(mapRatingFieldName("other")).toBe("root");
  });
});
