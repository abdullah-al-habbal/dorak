import { describe, expect, it } from "vitest";

import { EMPTY_CATALOG_ATTRIBUTES } from "@/lib/catalog/catalog-item-attributes.util";
import { enDictionary } from "@/locales/en/index.constant";
import { createCatalogItemFormSchema, isValidItemDuration } from "@/schemas/services/catalog/catalog-item-form.zod";

const messages = enDictionary.adminCatalog.items;
const schema = createCatalogItemFormSchema(messages);
const valid = { name_en: "Fade", name_ar: "تدريج", slug: "fade", category_id: "", description_en: "", description_ar: "", duration: "", is_active: true, tag_ids: [], attributes: EMPTY_CATALOG_ATTRIBUTES };

function issues(input: unknown): [string, string][] {
  return (schema.safeParse(input).error?.issues ?? []).map((issue) => [String(issue.path[0]), issue.message]);
}

describe("catalog item form schema", () => {
  it("accepts a minimal item", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("requires both names and the slug", () => {
    expect(issues({ ...valid, name_en: " ", name_ar: "", slug: " " })).toEqual([["name_en", messages.form.required], ["name_ar", messages.form.required], ["slug", messages.form.required]]);
  });

  it.each([["", true], ["30", true], ["1440", true], ["0", false], ["1441", false], ["1.5", false], ["abc", false]])("duration %j valid=%s", (text, ok) => {
    expect(isValidItemDuration(text)).toBe(ok);
    expect(schema.safeParse({ ...valid, duration: text }).success).toBe(ok);
  });

  it("reports an incomplete price range on the attributes field", () => {
    expect(issues({ ...valid, attributes: { ...EMPTY_CATALOG_ATTRIBUTES, priceMin: "10" } })).toEqual([["attributes", messages.attributes.issues.priceIncomplete]]);
  });
});
