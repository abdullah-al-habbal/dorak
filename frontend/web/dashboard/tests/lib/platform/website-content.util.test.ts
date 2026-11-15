import { describe, expect, it } from "vitest";

import { bodyJson, bodyPreview, localeText, parseBodyObject } from "@/lib/website-content.util";

describe("website content helpers", () => {
  it("reads one locale and treats the API's empty array as unset", () => {
    expect(localeText({ en: "Hello", ar: "مرحبا" }, "ar")).toBe("مرحبا");
    expect(localeText({ en: "Hello" }, "ar")).toBe("");
    expect(localeText([], "en")).toBe("");
    expect(localeText(null, "en")).toBe("");
    expect(localeText({ en: 5 }, "en")).toBe("");
  });

  it("shows one locale's body as editable JSON, or an empty object", () => {
    expect(bodyJson({ en: { heading: "H" } }, "en")).toBe('{\n  "heading": "H"\n}');
    expect(bodyJson({ en: [] }, "en")).toBe("{}");
    expect(bodyJson([], "en")).toBe("{}");
    expect(bodyJson(undefined, "ar")).toBe("{}");
  });

  it("parses only JSON objects", () => {
    expect(parseBodyObject('{"a":1}')).toEqual({ a: 1 });
    for (const bad of ["[1]", "3", '"x"', "null", "{broken", ""]) expect(parseBodyObject(bad), bad).toBeUndefined();
  });

  it("previews the heading and supporting line", () => {
    expect(bodyPreview({ heading: "H", subheading: "S" })).toEqual({ heading: "H", subheading: "S" });
    expect(bodyPreview({ heading: 1 })).toEqual({ heading: "", subheading: "" });
  });
});
