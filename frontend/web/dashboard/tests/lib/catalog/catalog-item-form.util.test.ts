import { describe, expect, it } from "vitest";

import { formToItemPayload, itemToForm, mapItemFieldName, resolveItemCategory } from "@/lib/catalog/catalog-item-form.util";
import type { CatalogItem } from "@/types/services/catalog-item.type";

const item = {
  id: "i1", category_id: "c1", slug: "fade", name: { en: "Fade", ar: "تدريج" }, description: { en: "Short", ar: null },
  default_duration_minutes: 45, is_active: false, tags: [{ id: "t1" }], price_range: null,
} as unknown as CatalogItem;

describe("catalog item mapping", () => {
  it("starts a new item active with nothing chosen", () => {
    expect(itemToForm(undefined)).toMatchObject({ name_en: "", slug: "", category_id: "", duration: "", is_active: true, tag_ids: [] });
  });

  it("reads an existing item", () => {
    expect(itemToForm(item)).toMatchObject({ name_en: "Fade", description_en: "Short", description_ar: "", category_id: "c1", duration: "45", is_active: false, tag_ids: ["t1"] });
  });

  it("falls back to the first loaded category", () => {
    expect(resolveItemCategory("", ["a", "b"])).toBe("a");
    expect(resolveItemCategory("b", ["a"])).toBe("b");
    expect(resolveItemCategory("", [])).toBe("");
  });

  it("builds the payload: trimmed text, null for blank descriptions and duration", () => {
    const payload = formToItemPayload({ ...itemToForm(undefined), name_en: " Fade ", name_ar: "تدريج", slug: " fade ", description_en: " ", duration: " " }, "c1");
    expect(payload).toMatchObject({ category_id: "c1", name: { en: "Fade", ar: "تدريج" }, slug: "fade", description: { en: null, ar: null }, default_duration_minutes: null, price_range: null, tag_ids: [] });
  });

  it("sends the duration as a number", () => {
    expect(formToItemPayload(itemToForm(item), "c1").default_duration_minutes).toBe(45);
  });

  it("maps backend field names", () => {
    expect(mapItemFieldName("default_duration_minutes")).toBe("duration");
    expect(mapItemFieldName("price_range.min")).toBe("attributes");
    expect(mapItemFieldName("description.ar")).toBe("description_ar");
    expect(mapItemFieldName("zzz")).toBe("root");
  });
});
