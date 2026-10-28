import { describe, expect, it } from "vitest";
import { catalogItemFormSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

const valid = {
  categoryId: "c1",
  nameEn: "Fade",
  nameAr: "فيد",
  slug: "fade",
  descriptionEn: "",
  descriptionAr: "",
  isActive: true,
  durationMinutes: "",
  faceShapes: [],
  hairTextures: [],
  tagIds: [],
};

describe("catalogItemFormSchema", () => {
  it("treats an empty duration as none", () => {
    expect(catalogItemFormSchema.parse(valid).durationMinutes).toBeNull();
  });

  it("coerces and bounds the duration", () => {
    expect(
      catalogItemFormSchema.parse({ ...valid, durationMinutes: "45" })
        .durationMinutes,
    ).toBe(45);
    expect(
      catalogItemFormSchema.safeParse({ ...valid, durationMinutes: "1441" })
        .success,
    ).toBe(false);
  });

  it("normalises a lone checkbox value or an unchecked one to an array", () => {
    const lone = catalogItemFormSchema.parse({
      ...valid,
      faceShapes: "oval",
      tagIds: false,
    });
    expect(lone.faceShapes).toEqual(["oval"]);
    expect(lone.tagIds).toEqual([]);
  });

  it("rejects an unknown face shape and a missing category", () => {
    expect(
      catalogItemFormSchema.safeParse({ ...valid, faceShapes: ["blob"] })
        .success,
    ).toBe(false);
    expect(
      catalogItemFormSchema.safeParse({ ...valid, categoryId: "" }).success,
    ).toBe(false);
  });
});
