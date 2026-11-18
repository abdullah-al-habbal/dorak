import { describe, expect, it } from "vitest";

import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import type { ContentPage } from "@/types/platform/website-content.type";

import { bodyJson, bodyPreview, localeText, missingLocales, parseBodyObject, testimonialSectionOptions } from "@/lib/platform/website-content.util";

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

describe("testimonialSectionOptions", () => {
  const section = (id: string, type: string, title: unknown) => ({ id, page_id: "p", section_type: type, title, body: {}, sort_order: 1, universe_visibility: UniverseVisibility.All });
  const pages = [
    { id: "p", slug: "home", title: {}, sections: [section("s1", "testimonials", { en: "Loved", ar: "محبوب" }), section("s2", "hero", { en: "Hero" }), section("s3", "testimonials", [])] },
  ] as unknown as ContentPage[];

  it("keeps testimonial sections only and labels them with the page and a title, never an id", () => {
    expect(testimonialSectionOptions(pages, "en")).toEqual([
      { id: "s1", label: "/home · Loved" },
      { id: "s3", label: "/home · testimonials" },
    ]);
    expect(testimonialSectionOptions(pages, "ar")[0].label).toBe("/home · محبوب");
  });
});

describe("missingLocales", () => {
  const section = (body: unknown) => ({ id: "s", page_id: "p", section_type: "legal_text", body, sort_order: 0, universe_visibility: UniverseVisibility.All });
  const page = (overrides: Partial<ContentPage>): ContentPage => ({ id: "p", slug: "privacy", title: { en: "Privacy", ar: "الخصوصية" }, published_at: null, sections: [section({ en: { paragraphs: ["a"] }, ar: { paragraphs: ["ب"] } })], ...overrides }) as ContentPage;

  it("is empty for a page with both titles and every section translated", () => {
    expect(missingLocales(page({}))).toEqual([]);
  });

  it("flags a missing title, a missing section translation and a page with no sections", () => {
    expect(missingLocales(page({ title: { en: "Privacy", ar: " " } }))).toEqual(["ar"]);
    expect(missingLocales(page({ sections: [section({ en: { paragraphs: ["a"] }, ar: {} })] as ContentPage["sections"] }))).toEqual(["ar"]);
    expect(missingLocales(page({ sections: [] }))).toEqual(["en", "ar"]);
  });
});
