import type { CatalogItemAttributes } from "@/interfaces/services/catalog-item-attributes.interface";
import { minorUnitsToInput, parseMinorUnits } from "@/lib/core/format/money.util";
import type { CatalogItemPayload } from "@/services/api/mutation/services/catalog-admin.mutation";
import type { CatalogItem } from "@/types/services/catalog-item.type";

export type CatalogAttributesIssue = "priceIncomplete" | "priceInvalid" | "priceOrder";

export const EMPTY_CATALOG_ATTRIBUTES: CatalogItemAttributes = {
  priceMin: "",
  priceMax: "",
  currency: "",
  maintenance: "",
  stylePeriod: "",
  formality: "",
  faceShapes: [],
  hairTextures: [],
};

export function attributesFromItem(item?: CatalogItem): CatalogItemAttributes {
  if (!item) return EMPTY_CATALOG_ATTRIBUTES;
  return {
    priceMin: item.price_range ? minorUnitsToInput(item.price_range.min) : "",
    priceMax: item.price_range ? minorUnitsToInput(item.price_range.max) : "",
    currency: item.price_range?.currency ?? "",
    maintenance: item.maintenance_level ?? "",
    stylePeriod: item.style_period_type ?? "",
    formality: item.formality_level ?? "",
    faceShapes: item.face_shapes ?? [],
    hairTextures: item.hair_textures ?? [],
  };
}

function hasPrice(attributes: CatalogItemAttributes): boolean {
  return attributes.priceMin.trim() !== "" || attributes.priceMax.trim() !== "" || attributes.currency !== "";
}

/** A price range needs both ends and a currency, valid amounts, and a maximum that is not below the minimum. */
export function attributesIssue(attributes: CatalogItemAttributes): CatalogAttributesIssue | undefined {
  if (!hasPrice(attributes)) return undefined;
  if (attributes.priceMin.trim() === "" || attributes.priceMax.trim() === "" || attributes.currency === "") return "priceIncomplete";
  const min = parseMinorUnits(attributes.priceMin);
  const max = parseMinorUnits(attributes.priceMax);
  if (min === null || max === null) return "priceInvalid";
  return max < min ? "priceOrder" : undefined;
}

/** The attribute part of the item body; empty selections are sent as null so a saved value can be cleared. */
export function attributesToPayload(attributes: CatalogItemAttributes): Pick<CatalogItemPayload, "price_range" | "maintenance_level" | "style_period_type" | "formality_level" | "face_shapes" | "hair_textures"> {
  const min = parseMinorUnits(attributes.priceMin);
  const max = parseMinorUnits(attributes.priceMax);
  return {
    price_range: hasPrice(attributes) && min !== null && max !== null ? { min, max, currency: attributes.currency } : null,
    maintenance_level: attributes.maintenance || null,
    style_period_type: attributes.stylePeriod || null,
    formality_level: attributes.formality || null,
    face_shapes: attributes.faceShapes,
    hair_textures: attributes.hairTextures,
  };
}
