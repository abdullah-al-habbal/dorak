import { describe, expect, it } from "vitest";

import { EMPLOYMENT_NONE } from "@/config/ops/job-board.constant";
import { formToPostingBody, mapPostingFieldName, postingToForm } from "@/lib/jobs/job-posting-form.util";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";

const posting = {
  id: "j1", title: { en: "Barber", ar: "حلاق" }, description: { en: "Fades", ar: "تدريج" }, requirements: [],
  location: "Cairo", employment_type: "full_time", status: "closed",
} as unknown as BranchJobPosting;

describe("job posting mapping", () => {
  it("starts a new posting open with no employment type", () => {
    expect(postingToForm(undefined)).toMatchObject({ title_en: "", employment: EMPLOYMENT_NONE, status: "open", location: "" });
  });

  it("reads an existing posting, treating the API's empty requirements array as blank", () => {
    expect(postingToForm(posting)).toMatchObject({ title_en: "Barber", requirements_en: "", requirements_ar: "", location: "Cairo", employment: "full_time", status: "closed" });
  });

  it("sends null requirements, location and employment when blank, and no status for a new posting", () => {
    const body = formToPostingBody({ ...postingToForm(undefined), title_en: " Barber ", title_ar: "حلاق", description_en: "Fades", description_ar: "تدريج" }, false);
    expect(body).toEqual({
      title: { en: "Barber", ar: "حلاق" },
      description: { en: "Fades", ar: "تدريج" },
      requirements: null,
      location: null,
      employment_type: null,
      });
  });

  it("sends requirements when one language has text, and the status when editing", () => {
    const body = formToPostingBody({ ...postingToForm(posting), requirements_ar: " خبرة " }, true);
    expect(body.requirements).toEqual({ en: "", ar: "خبرة" });
    expect(body.location).toBe("Cairo");
    expect(body.employment_type).toBe("full_time");
    expect(body.status).toBe("closed");
  });

  it("maps backend field names", () => {
    expect(mapPostingFieldName("title.ar")).toBe("title_ar");
    expect(mapPostingFieldName("requirements.en")).toBe("requirements_en");
    expect(mapPostingFieldName("employment_type")).toBe("employment");
    expect(mapPostingFieldName("branch_id")).toBe("root");
  });
});
