import { describe, expect, it } from "vitest";

import { CONTENT_SORT_MAX, SECTION_BODY_MAX_BYTES } from "@/config/platform/website-content.constant";
import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import { enDictionary } from "@/locales/en/index.constant";
import { createPageFormSchema, createSectionFormSchema, createTestimonialFormSchema } from "@/schemas/platform/content/website-content-form.zod";

const content = enDictionary.content;

function issues(schema: { safeParse: (input: unknown) => { success: boolean; error?: { issues: { path: PropertyKey[]; message: string }[] } } }, input: unknown): Record<string, string> {
  const result = schema.safeParse(input);
  const found: Record<string, string> = {};
  for (const issue of result.error?.issues ?? []) found[String(issue.path[0])] = issue.message;
  return found;
}

describe("page form schema", () => {
  const schema = createPageFormSchema(content.pageForm);
  const valid = { title_en: "Home", title_ar: "الرئيسية", meta_en: "", meta_ar: "" };

  it("accepts both titles with empty descriptions and trims them", () => {
    expect(schema.parse({ ...valid, title_en: "  Home  " }).title_en).toBe("Home");
  });

  it("requires both titles, naming the field that is blank", () => {
    expect(issues(schema, { ...valid, title_en: "  ", title_ar: "" })).toEqual({ title_en: content.pageForm.required, title_ar: content.pageForm.required });
  });
});

describe("section form schema", () => {
  const schema = createSectionFormSchema(content.sectionForm);
  const valid = {
    title_en: "", title_ar: "", subtitle_en: "", subtitle_ar: "",
    body_en: '{"heading":"Hi"}', body_ar: "{}", media_url: "", sort: "3", universe_visibility: UniverseVisibility.All,
  };

  it("accepts JSON objects and a whole-number order", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it.each(["not json", "[1,2]", "42", '"text"'])("rejects %s as a body", (body) => {
    expect(issues(schema, { ...valid, body_ar: body })).toEqual({ body_ar: content.sectionForm.invalidJson });
  });

  it.each(["-1", "1.5", "abc", String(CONTENT_SORT_MAX + 1)])("rejects %s as an order", (sort) => {
    expect(issues(schema, { ...valid, sort })).toEqual({ sort: content.sectionForm.invalidSort });
  });

  it("treats a blank order as 0, as the hand-rolled dialog did", () => {
    expect(schema.safeParse({ ...valid, sort: "" }).success).toBe(true);
  });

  it("rejects bodies that are too large together, on the first body", () => {
    const big = JSON.stringify({ text: "x".repeat(SECTION_BODY_MAX_BYTES) });
    expect(issues(schema, { ...valid, body_en: big })).toEqual({ body_en: content.sectionForm.tooLarge });
  });

  it("rejects an unknown audience", () => {
    expect(schema.safeParse({ ...valid, universe_visibility: "kids" }).success).toBe(false);
  });
});

describe("testimonial form schema", () => {
  const schema = createTestimonialFormSchema(content.testimonialForm);
  const valid = { author_name: "Sam", title_en: "", title_ar: "", body_en: "Great", body_ar: "ممتاز", section_id: "", rating: "5", avatar_url: "", sort: "0" };

  it("accepts a complete testimonial, with or without a section", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, section_id: "s1" }).success).toBe(true);
  });

  it("requires the author and both quotes", () => {
    const required = content.testimonialForm.required;
    expect(issues(schema, { ...valid, author_name: " ", body_en: "", body_ar: "  " })).toEqual({ author_name: required, body_en: required, body_ar: required });
  });

  it.each(["0", "6", "", "five"])("rejects %s as a rating", (rating) => {
    expect(issues(schema, { ...valid, rating })).toEqual({ rating: content.testimonialForm.required });
  });

  it.each(["-1", "2.5", "x", String(CONTENT_SORT_MAX + 1)])("rejects %s as an order", (sort) => {
    expect(issues(schema, { ...valid, sort })).toEqual({ sort: content.testimonialForm.invalidSort });
  });
});
