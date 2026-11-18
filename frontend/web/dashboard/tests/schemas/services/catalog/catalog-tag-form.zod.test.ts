import { describe, expect, it } from "vitest";

import { CATALOG_TAG_GROUP_MAX } from "@/config/platform/admin-catalog.constant";
import { enDictionary } from "@/locales/en/index.constant";
import { createCatalogTagFormSchema } from "@/schemas/services/catalog/catalog-tag-form.zod";

const messages = enDictionary.adminCatalog.tags.form;
const schema = createCatalogTagFormSchema(messages);
const valid = { name_en: "Fade", name_ar: "تدرج", group_name: "", is_active: true };

describe("catalog tag form schema", () => {
  it("accepts both names with an empty group", () => {
    expect(schema.safeParse(valid).success).toBe(true);
  });

  it("requires both names, trimmed", () => {
    const result = schema.safeParse({ ...valid, name_en: "  ", name_ar: "" });
    expect(result.error?.issues.map((issue) => [issue.path[0], issue.message])).toEqual([
      ["name_en", messages.required],
      ["name_ar", messages.required],
    ]);
  });

  it("caps the group length", () => {
    expect(schema.safeParse({ ...valid, group_name: "x".repeat(CATALOG_TAG_GROUP_MAX + 1) }).success).toBe(false);
  });
});
