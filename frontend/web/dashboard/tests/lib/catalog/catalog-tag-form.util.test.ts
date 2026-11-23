import { describe, expect, it } from "vitest";

import { formToTagPayload, mapTagFieldName, tagToForm } from "@/lib/catalog/catalog-tag-form.util";
import type { CatalogTag } from "@/types/services/catalog-item.type";

const tag = { id: "t1", name: { en: "Fade", ar: "تدرج" }, group_name: "Cut", group_name_translations: { en: "Cut", ar: "قصة" }, is_active: false } as unknown as CatalogTag;

describe("catalog tag mapping", () => {
  it("starts a new tag empty and active", () => {
    expect(tagToForm(undefined)).toEqual({ name_en: "", name_ar: "", group_name_en: "", group_name_ar: "", is_active: true });
  });

  it("reads an existing tag, including its inactive state", () => {
    expect(tagToForm(tag)).toEqual({ name_en: "Fade", name_ar: "تدرج", group_name_en: "Cut", group_name_ar: "قصة", is_active: false });
  });

  it("trims text and sends a blank group pair as null", () => {
    expect(formToTagPayload({ name_en: " Fade ", name_ar: "تدرج", group_name_en: "  ", group_name_ar: "", is_active: true })).toEqual({ name: { en: "Fade", ar: "تدرج" }, group_name: null, is_active: true });
    expect(formToTagPayload({ ...tagToForm(tag), group_name_en: " Cut ", group_name_ar: " قصة " }).group_name).toEqual({ en: "Cut", ar: "قصة" });
  });

  it("reads a tag without a group as an empty pair", () => {
    expect(tagToForm({ ...tag, group_name_translations: null } as unknown as CatalogTag)).toMatchObject({ group_name_en: "", group_name_ar: "" });
  });

  it("maps backend field names", () => {
    expect(mapTagFieldName("name_en")).toBe("name_en");
    expect(mapTagFieldName("group_name.en")).toBe("group_name_en");
    expect(mapTagFieldName("group_name.ar")).toBe("group_name_ar");
    expect(mapTagFieldName("slug")).toBe("root");
  });
});
