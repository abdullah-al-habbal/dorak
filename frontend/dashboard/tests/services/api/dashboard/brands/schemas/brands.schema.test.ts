import { describe, expect, it } from "vitest";
import { brandFormSchema } from "@/services/api/dashboard/brands/schemas/brands.schema";

const valid = {
  nameEn: "Cuts",
  nameAr: "قص",
  descriptionEn: "",
  descriptionAr: "",
  logoUrl: "",
  baseCurrencyCode: "cur1",
  universe: "unisex",
};

describe("brandFormSchema", () => {
  it("accepts an empty logo or a url", () => {
    expect(brandFormSchema.safeParse(valid).success).toBe(true);
    expect(
      brandFormSchema.safeParse({ ...valid, logoUrl: "https://x.test/l.png" })
        .success,
    ).toBe(true);
  });

  it("rejects a non-url logo, a missing currency and an unknown universe", () => {
    expect(
      brandFormSchema.safeParse({ ...valid, logoUrl: "nope" }).success,
    ).toBe(false);
    expect(
      brandFormSchema.safeParse({ ...valid, baseCurrencyCode: "" }).success,
    ).toBe(false);
    expect(
      brandFormSchema.safeParse({ ...valid, universe: "kids" }).success,
    ).toBe(false);
  });
});
