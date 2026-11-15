import { describe, expect, it } from "vitest";

import { VenueUniverse } from "@/enums/venue-universe.enum";
import { catalogCategoryToForm, emptyCatalogCategoryForm, formToCatalogCategoryPayload, isCatalogCategoryInUse } from "@/lib/services/catalog-category-form.util";
import { withCategoryActive } from "@/lib/services/catalog-category-cache.util";
import type { AdminCatalogCategory } from "@/types/services/admin-catalog-category.type";

function category(overrides: Partial<AdminCatalogCategory> = {}): AdminCatalogCategory {
  return {
    id: "c1",
    name: { en: "Hair", ar: "الشعر" },
    description: null,
    slug: "hair",
    parent_id: null,
    universe: VenueUniverse.Men,
    is_active: true,
    sort_order: 3,
    items_count: 0,
    children_count: 0,
    services_count: 0,
    created_at: null,
    children: [],
    ...overrides,
  };
}

describe("catalog category form", () => {
  it("starts empty, unisex, active and first in order", () => {
    expect(emptyCatalogCategoryForm()).toEqual({ name_en: "", name_ar: "", description_en: "", description_ar: "", universe: VenueUniverse.Unisex, sort_order: "0", is_active: true });
  });

  it("round-trips a category; blank text is sent as null and a blank order as 0", () => {
    const values = catalogCategoryToForm(category({ description: { en: "Cuts", ar: null } }));
    expect(values).toMatchObject({ name_ar: "الشعر", description_en: "Cuts", description_ar: "", sort_order: "3" });
    expect(formToCatalogCategoryPayload({ ...values, name_en: "  Hair ", sort_order: " " })).toEqual({
      name: { en: "Hair", ar: "الشعر" },
      description: { en: "Cuts", ar: null },
      universe: VenueUniverse.Men,
      sort_order: 0,
      is_active: true,
    });
  });

  it.each([
    [{ children_count: 1 }, true],
    [{ items_count: 2 }, true],
    [{ services_count: 1 }, true],
    [{}, false],
  ])("treats %o as in use: %s", (counts, inUse) => {
    expect(isCatalogCategoryInUse(category(counts))).toBe(inUse);
  });
});

describe("catalog category cache", () => {
  it("flips one top-level category and leaves its subcategories alone", () => {
    const child = { ...category({ id: "c2", parent_id: "c1" }) };
    const list = [category({ children: [child] }), category({ id: "c3" })];
    const next = withCategoryActive(list, "c1", false);
    expect(next?.[0]).toMatchObject({ is_active: false, children: [{ id: "c2", is_active: true }] });
    expect(next?.[1]).toBe(list[1]);
  });

  it("returns the same list when the category is absent", () => {
    const list = [category()];
    expect(withCategoryActive(list, "missing", false)).toBe(list);
    expect(withCategoryActive(undefined, "c1", false)).toBeUndefined();
  });
});
