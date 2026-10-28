import { describe, expect, it } from "vitest";
import {
  mapCatalogCategory,
  mapCatalogItem,
  mapCatalogTag,
} from "@/services/api/dashboard/catalog/catalog.mapper.util";

describe("catalog mappers", () => {
  it("maps an item with tags, traits and duration", () => {
    expect(
      mapCatalogItem({
        id: "i1",
        category_id: "c1",
        name: { en: "Fade", ar: "فيد" },
        description: { en: "Short sides" },
        slug: "fade",
        is_active: true,
        default_duration_minutes: 30,
        face_shapes: ["oval", "unknown-shape"],
        hair_textures: ["wavy"],
        tags: [{ id: "t1" }, { id: "t2" }],
      }),
    ).toEqual({
      id: "i1",
      categoryId: "c1",
      name: { en: "Fade", ar: "فيد" },
      description: { en: "Short sides", ar: "" },
      slug: "fade",
      isActive: true,
      durationMinutes: 30,
      faceShapes: ["oval"],
      hairTextures: ["wavy"],
      tagIds: ["t1", "t2"],
    });
  });

  it("tolerates a sparse item payload", () => {
    const item = mapCatalogItem({ id: "i2" });
    expect(item.isActive).toBe(false);
    expect(item.durationMinutes).toBeNull();
    expect(item.tagIds).toEqual([]);
  });

  it("maps categories and tags", () => {
    expect(mapCatalogCategory({ id: "c", name: { en: "Cuts" } })).toEqual({
      id: "c",
      name: { en: "Cuts", ar: "" },
    });
    expect(
      mapCatalogTag({ id: "t", name: { en: "Classic" }, group: "style" }).group,
    ).toBe("style");
  });
});
