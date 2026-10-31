import { CatalogItemSchema } from "@/services/api/dashboard/catalog/schemas/catalog.schema";

export const CATALOG_FACE_SHAPE_SET: ReadonlySet<string> = new Set(
  CatalogItemSchema.shape.faceShapes.element.options,
);

export const CATALOG_HAIR_TEXTURE_SET: ReadonlySet<string> = new Set(
  CatalogItemSchema.shape.hairTextures.element.options,
);
