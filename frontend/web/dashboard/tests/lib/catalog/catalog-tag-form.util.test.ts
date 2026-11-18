import { describe, expect, it } from "vitest";

import { formToTagPayload, mapTagFieldName, tagToForm } from "@/lib/catalog/catalog-tag-form.util";
import type { CatalogTag } from "@/types/services/catalog-item.type";

const tag = { id: "t1", name: { en: "Fade", ar: "تدرج" }, group_name: "Cut", is_active: false } as unknown as CatalogTag;

describe("catalog tag mapping", () => {
  it("starts a new tag empty and active", () => {
    expect(tagToForm(undefined)).toEqual({ name_en: "", name_ar: "", group_name: "", is_active: true });
  });

  it("reads an existing tag, including its inactive state", () => {
    expect(tagToForm(tag)).toEqual({ name_en: "Fade", name_ar: "تدرج", group_name: "Cut", is_active: false });
  });

  it("trims text and sends a blank group as null", () => {
    expect(formToTagPayload({ name_en: " Fade ", name_ar: "تدرج", group_name: "  ", is_active: true })).toEqual({ name: { en: "Fade", ar: "تدرج" }, group_name: null, is_active: true });
    expect(formToTagPayload({ ...tagToForm(tag), group_name: " Cut " }).group_name).toBe("Cut");
  });

  it("maps backend field names", () => {
    expect(mapTagFieldName("name_en")).toBe("name_en");
    expect(mapTagFieldName("group_name")).toBe("group_name");
    expect(mapTagFieldName("slug")).toBe("root");
  });
});
