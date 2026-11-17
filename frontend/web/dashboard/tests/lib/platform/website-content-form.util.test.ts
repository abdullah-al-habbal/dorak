import { describe, expect, it } from "vitest";

import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import {
  formToPagePayload,
  formToSectionPayload,
  formToTestimonialPayload,
  mapPageFieldName,
  mapSectionFieldName,
  mapTestimonialFieldName,
  pageToForm,
  parseSortOrder,
  sectionToForm,
  testimonialToForm,
} from "@/lib/platform/website-content-form.util";
import type { ContentPage, ContentSection, Testimonial } from "@/types/platform/website-content.type";

const page = { id: "p1", slug: "home", title: { en: "Home", ar: "الرئيسية" }, meta_description: [], sections: [] } as unknown as ContentPage;
const section = {
  id: "s1", page_id: "p1", section_type: "hero", title: { en: "Hi", ar: "أهلا" }, subtitle: [], body: { en: { heading: "Hi" }, ar: {} },
  media_url: null, sort_order: 2, universe_visibility: UniverseVisibility.Men,
} as unknown as ContentSection;
const testimonial = {
  id: "t1", section_id: null, author_name: "Sam", author_title: [], body: { en: "Great", ar: "ممتاز" }, avatar_url: null, rating: 4, sort_order: 7,
} as unknown as Testimonial;

describe("parseSortOrder", () => {
  it("accepts whole numbers in range and reads blank as 0", () => {
    expect(parseSortOrder("12")).toBe(12);
    expect(parseSortOrder("")).toBe(0);
  });
  it("rejects fractions, negatives, text and out-of-range values", () => {
    for (const value of ["1.5", "-1", "abc", "100001"]) expect(parseSortOrder(value)).toBeUndefined();
  });
});

describe("page mapping", () => {
  it("reads the API's empty array as empty text and round-trips to the same payload", () => {
    const form = pageToForm(page);
    expect(form).toEqual({ title_en: "Home", title_ar: "الرئيسية", meta_en: "", meta_ar: "" });
    expect(formToPagePayload({ ...form, title_en: "  Home  " })).toEqual({ title: { en: "Home", ar: "الرئيسية" }, meta_description: { en: "", ar: "" } });
  });

  it("maps backend field names to form fields, unknown ones to the root", () => {
    expect(mapPageFieldName("title.ar")).toBe("title_ar");
    expect(mapPageFieldName("meta_description.en")).toBe("meta_en");
    expect(mapPageFieldName("slug")).toBe("root");
  });
});

describe("section mapping", () => {
  it("builds the payload with parsed bodies, a null blank media url and a numeric order", () => {
    const payload = formToSectionPayload({ ...sectionToForm(section), media_url: "  ", sort: "5" });
    expect(payload).toEqual({
      title: { en: "Hi", ar: "أهلا" },
      subtitle: { en: "", ar: "" },
      body: { en: { heading: "Hi" }, ar: {} },
      media_url: null,
      sort_order: 5,
      universe_visibility: UniverseVisibility.Men,
    });
  });

  it("keeps a media url trimmed", () => {
    expect(formToSectionPayload({ ...sectionToForm(section), media_url: " /img/a.png " }).media_url).toBe("/img/a.png");
  });

  it("maps nested backend names through their parent", () => {
    expect(mapSectionFieldName("body.en")).toBe("body_en");
    expect(mapSectionFieldName("body.ar.heading")).toBe("body_ar");
    expect(mapSectionFieldName("sort_order")).toBe("sort");
    expect(mapSectionFieldName("section_type")).toBe("root");
  });
});

describe("testimonial mapping", () => {
  it("starts a new testimonial on the default section with rating 5 and order 0", () => {
    expect(testimonialToForm(undefined, "s9")).toMatchObject({ author_name: "", section_id: "s9", rating: "5", sort: "0" });
  });

  it("keeps an existing testimonial's missing section empty instead of defaulting it", () => {
    expect(testimonialToForm(testimonial, "s9")).toMatchObject({ section_id: "", rating: "4", sort: "7" });
  });

  it("builds the payload: trimmed text, null section and avatar when blank, numeric rating and order", () => {
    const payload = formToTestimonialPayload({ ...testimonialToForm(testimonial, ""), author_name: " Sam ", avatar_url: "  " });
    expect(payload).toEqual({
      section_id: null,
      author_name: "Sam",
      author_title: { en: "", ar: "" },
      body: { en: "Great", ar: "ممتاز" },
      avatar_url: null,
      rating: 4,
      sort_order: 7,
    });
    expect(formToTestimonialPayload({ ...testimonialToForm(testimonial, ""), section_id: "s1" }).section_id).toBe("s1");
  });

  it("maps backend field names to form fields", () => {
    expect(mapTestimonialFieldName("author_title.en")).toBe("title_en");
    expect(mapTestimonialFieldName("avatar_url")).toBe("avatar_url");
    expect(mapTestimonialFieldName("sort_order")).toBe("sort");
    expect(mapTestimonialFieldName("unknown")).toBe("root");
  });
});
