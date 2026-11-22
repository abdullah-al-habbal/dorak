import { describe, expect, it } from "vitest";

import { CatalogTagGroup } from "@/enums/catalog/catalog-tag-group.enum";
import { tagGroupLabel } from "@/lib/catalog/catalog-tag-group.util";
import { arDictionary } from "@/locales/ar/index.constant";
import { enDictionary } from "@/locales/en/index.constant";

const en = enDictionary.adminCatalog.tags;
const ar = arDictionary.adminCatalog.tags;

describe("tagGroupLabel", () => {
  it("localizes a known group key in both languages", () => {
    expect(tagGroupLabel("hair_type", en.tagGroups, en.noGroup)).toBe("Hair type");
    expect(tagGroupLabel("hair_type", ar.tagGroups, ar.noGroup)).toBe(ar.tagGroups.hair_type);
  });

  it("accepts the key with different case and spacing", () => {
    expect(tagGroupLabel("  Style ", en.tagGroups, en.noGroup)).toBe("Style");
  });

  it("keeps a custom group exactly as the admin typed it", () => {
    expect(tagGroupLabel("Values", en.tagGroups, en.noGroup)).toBe("Values");
    expect(tagGroupLabel("قيم", ar.tagGroups, ar.noGroup)).toBe("قيم");
  });

  it("shows the no-group text for an empty value", () => {
    expect(tagGroupLabel(null, en.tagGroups, en.noGroup)).toBe("No group");
    expect(tagGroupLabel("   ", ar.tagGroups, ar.noGroup)).toBe(ar.noGroup);
  });

  it("has a label in both languages for every known group", () => {
    for (const group of Object.values(CatalogTagGroup)) {
      expect(en.tagGroups[group]).toBeTruthy();
      expect(ar.tagGroups[group]).toBeTruthy();
    }
  });
});
