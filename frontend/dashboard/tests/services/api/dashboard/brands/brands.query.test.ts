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
        logo: "",
        baseCurrencyId: "cur1",
        universe: "men",
      }),
    ).toEqual({
      name: { en: "Cuts", ar: "قص" },
      description: { en: null, ar: null },
      logo: null,
      base_currency_id: "cur1",
      universe: "men",
    });
  });
});
