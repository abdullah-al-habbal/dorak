import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { createJobPostingFormSchema } from "@/schemas/jobs/job-posting-form.zod";

const messages = enDictionary.jobs.form;
const schema = createJobPostingFormSchema(messages);
const valid = {
  title_en: "Barber", title_ar: "حلاق", description_en: "Fades", description_ar: "تدريج",
  requirements_en: "", requirements_ar: "", location: "", employment: "none", status: "open",
};

describe("job posting form schema", () => {
  it("accepts titles and descriptions in both languages with everything else blank", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("requires a title and a description in both languages", () => {
    const result = schema.safeParse({ ...valid, title_en: " ", title_ar: "", description_en: "", description_ar: "  " });
    expect(result.error?.issues.map((issue) => [issue.path[0], issue.message])).toEqual([
      ["title_en", messages.required],
      ["title_ar", messages.required],
      ["description_en", messages.required],
      ["description_ar", messages.required],
    ]);
  });

  it("rejects over-long optional text", () => {
    expect(schema.safeParse({ ...valid, location: "x".repeat(121) }).success).toBe(false);
    expect(schema.safeParse({ ...valid, requirements_en: "x".repeat(2001) }).success).toBe(false);
  });
});
