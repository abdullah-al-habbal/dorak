import { describe, expect, it } from "vitest";
import { brandPayload } from "@/services/api/dashboard/brands/brands.mapper.util";

describe("brandPayload", () => {
  it("nulls an empty logo and description", () => {
    expect(
      brandPayload({
        nameEn: "Cuts",
        nameAr: "قص",
        descriptionEn: "",
        descriptionAr: "",
        logoUrl: "",
        baseCurrencyCode: "cur1",
        universe: "men",
      }),
    ).toEqual({
      name: { en: "Cuts", ar: "قص" },
      description: { en: null, ar: null },
      logo_url: null,
      base_currency_code: "cur1",
      universe: "men",
    });
  });
});
