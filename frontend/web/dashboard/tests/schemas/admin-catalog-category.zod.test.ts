import { describe, expect, it } from "vitest";

import { enDictionary } from "@/locales/en/index.constant";
import { adminCatalogCategoryListSchema, catalogSubcategorySchema } from "@/schemas/admin-catalog-category.zod";
import { createCatalogCategorySchema } from "@/schemas/catalog-category-form.zod";
import { catalogItemPreviewListSchema } from "@/schemas/catalog-item-preview.zod";

const row = {
  id: "c1",
  name: { en: "Hair", ar: "الشعر" },
  description: [],
  slug: "hair",
  parent_id: null,
  universe: "men",
  is_active: true,
  sort_order: 0,
  items_count: 2,
  children_count: 1,
  services_count: 4,
  created_at: "2026-11-08T10:00:00+00:00",
};

describe("admin catalog category schema", () => {
  it("parses the admin list with subcategories and reads an empty description as null", () => {
    const [parsed] = adminCatalogCategoryListSchema.parse([{ ...row, children: [{ ...row, id: "c2", parent_id: "c1", is_active: false }] }]);
    expect(parsed?.description).toBeNull();
    expect(parsed?.children[0]?.is_active).toBe(false);
  });

  it("defaults missing children and rejects an unknown audience", () => {
    expect(adminCatalogCategoryListSchema.parse([row])[0]?.children).toEqual([]);
    expect(catalogSubcategorySchema.safeParse({ ...row, universe: "kids" }).success).toBe(false);
  });

  it("parses the read-only item preview", () => {
    expect(catalogItemPreviewListSchema.parse([{ id: "i1", name: { en: "Fade", ar: "فيد" }, default_duration_minutes: null, is_active: false, slug: "fade" }])[0]).not.toHaveProperty("slug");
  });
});

describe("catalog category form schema", () => {
  const schema = createCatalogCategorySchema(enDictionary.adminCatalog.form.validation);
  const valid = { name_en: "Hair", name_ar: "الشعر", description_en: "", description_ar: "", universe: "men", sort_order: "0", is_active: true };

  it("accepts a valid category and a blank order", () => {
    expect(schema.safeParse(valid).success).toBe(true);
    expect(schema.safeParse({ ...valid, sort_order: "" }).success).toBe(true);
  });

  it.each([
    [{ name_ar: "  " }, "name_ar"],
    [{ name_en: "x".repeat(121) }, "name_en"],
    [{ description_en: "x".repeat(1001) }, "description_en"],
    [{ sort_order: "65536" }, "sort_order"],
    [{ sort_order: "1.5" }, "sort_order"],
    [{ universe: "kids" }, "universe"],
  ])("rejects %o on %s", (patch, field) => {
    const result = schema.safeParse({ ...valid, ...patch });
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual([field]);
  });
});
