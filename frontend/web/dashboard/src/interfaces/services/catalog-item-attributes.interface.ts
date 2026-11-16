import type { FaceShape } from "@/enums/catalog/face-shape.enum";
import type { HairTexture } from "@/enums/catalog/hair-texture.enum";

/** The optional style attributes of a catalog item, as the form holds them. Empty strings mean "not set". */
export interface CatalogItemAttributes {
  priceMin: string;
  priceMax: string;
  currency: string;
  maintenance: string;
  stylePeriod: string;
  formality: string;
  faceShapes: FaceShape[];
  hairTextures: HairTexture[];
}
