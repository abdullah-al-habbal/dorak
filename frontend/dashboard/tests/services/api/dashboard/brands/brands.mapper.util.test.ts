import { describe, expect, it } from "vitest";
import { mapBrand } from "@/services/api/dashboard/brands/brands.mapper.util";

describe("mapBrand", () => {
  it("maps currency, universe and branch count", () => {
    expect(
      mapBrand({
        id: "b1",
        name: { en: "Cuts", ar: "قص" },
        description: { en: "d" },
        logo_url: "https://x.test/l.png",
        slug: "cuts",
        universe: "men",
        base_currency: { id: "cur1", code: "SAR" },
        branches_count: 3,
      }),
    ).toEqual({
      id: "b1",
      name: { en: "Cuts", ar: "قص" },
      description: { en: "d", ar: "" },
      logoUrl: "https://x.test/l.png",
      slug: "cuts",
      universe: "men",
      baseCurrencyCode: "SAR",
      branchesCount: 3,
    });
  });

  it("falls back for a sparse payload and unknown universe", () => {
    const brand = mapBrand({ id: "b2", universe: "robots" });
    expect(brand.universe).toBe("unisex");
    expect(brand.baseCurrencyCode).toBeNull();
    expect(brand.branchesCount).toBe(0);
  });
});
