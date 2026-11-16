import { describe, expect, it } from "vitest";

import { FaceShape } from "@/enums/catalog/face-shape.enum";
import { attributesFromItem, attributesIssue, attributesToPayload, EMPTY_CATALOG_ATTRIBUTES } from "@/lib/catalog/catalog-item-attributes.util";
import type { CatalogItem } from "@/types/services/catalog-item.type";

const filled = { ...EMPTY_CATALOG_ATTRIBUTES, priceMin: "10", priceMax: "25.50", currency: "USD" };

describe("catalog item attributes", () => {
  it("starts empty for a new item and reads a saved one in major units", () => {
    expect(attributesFromItem(undefined)).toEqual(EMPTY_CATALOG_ATTRIBUTES);
    const item = { price_range: { min: 1000, max: 2550, currency: "USD" }, maintenance_level: "low", face_shapes: [FaceShape.Oval] } as unknown as CatalogItem;
    expect(attributesFromItem(item)).toMatchObject({ priceMin: "10.00", priceMax: "25.50", currency: "USD", maintenance: "low", faceShapes: ["oval"] });
  });

  it("accepts no price at all or a complete valid one", () => {
    expect(attributesIssue(EMPTY_CATALOG_ATTRIBUTES)).toBeUndefined();
    expect(attributesIssue(filled)).toBeUndefined();
  });

  it("flags a partial, malformed or reversed price range", () => {
    expect(attributesIssue({ ...filled, currency: "" })).toBe("priceIncomplete");
    expect(attributesIssue({ ...filled, priceMax: "" })).toBe("priceIncomplete");
    expect(attributesIssue({ ...filled, priceMin: "abc" })).toBe("priceInvalid");
    expect(attributesIssue({ ...filled, priceMin: "30" })).toBe("priceOrder");
  });

  it("sends minor units and null for whatever is not set", () => {
    expect(attributesToPayload(filled)).toEqual({ price_range: { min: 1000, max: 2550, currency: "USD" }, maintenance_level: null, style_period_type: null, formality_level: null, face_shapes: [], hair_textures: [] });
    expect(attributesToPayload({ ...EMPTY_CATALOG_ATTRIBUTES, maintenance: "high", faceShapes: [FaceShape.Round] })).toMatchObject({ price_range: null, maintenance_level: "high", face_shapes: ["round"] });
  });
});
