import { describe, expect, it } from "vitest";
import { catalogItemPayload } from "@/services/api/dashboard/catalog/catalog.query";

describe("catalogItemPayload", () => {
  it("sends snake_case fields and nulls empty descriptions", () => {
    expect(
      catalogItemPayload({
        categoryId: "c1",
        nameEn: "Fade",
        nameAr: "فيد",
        slug: "fade",
        descriptionEn: "",
        descriptionAr: "وصف",
        isActive: false,
        durationMinutes: null,
        faceShapes: ["oval"],
        hairTextures: [],
        tagIds: ["t1"],
      }),
    ).toEqual({
      category_id: "c1",
      name: { en: "Fade", ar: "فيد" },
      description: { en: null, ar: "وصف" },
      slug: "fade",
      is_active: false,
      default_duration_minutes: null,
      face_shapes: ["oval"],
      hair_textures: [],
      tag_ids: ["t1"],
    });
  });
});
