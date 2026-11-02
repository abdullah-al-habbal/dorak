import { describe, expect, it } from "vitest";
import {
  inviteAffiliationFormSchema,
  jobPostingFormSchema,
} from "@/services/api/dashboard/people/schemas/people.schema";

describe("inviteAffiliationFormSchema", () => {
  const barberId = "6f1c1b0e-8c47-4d0a-9d0a-1f6f7a2b3c4d";

  it("accepts a uuid and treats a blank commission as null", () => {
    expect(
      inviteAffiliationFormSchema.parse({ barberId, commissionPercent: "" }),
    ).toEqual({ barberId, commissionPercent: null });
  });

  it("rejects a bad id and an out-of-range commission", () => {
    expect(
      inviteAffiliationFormSchema.safeParse({ barberId: "x" }).success,
    ).toBe(false);
    expect(
      inviteAffiliationFormSchema.safeParse({
        barberId,
        commissionPercent: "101",
      }).success,
    ).toBe(false);
  });
});

describe("jobPostingFormSchema", () => {
  const valid = {
    titleEn: "a",
    titleAr: "ب",
    descriptionEn: "c",
    descriptionAr: "د",
    location: "",
    type: "",
    status: "open",
  };

  it("requires both languages for title and description", () => {
    expect(jobPostingFormSchema.safeParse(valid).success).toBe(true);
    expect(
      jobPostingFormSchema.safeParse({ ...valid, titleAr: "" }).success,
    ).toBe(false);
    expect(
      jobPostingFormSchema.safeParse({ ...valid, status: "deleted" }).success,
    ).toBe(false);
  });
});
