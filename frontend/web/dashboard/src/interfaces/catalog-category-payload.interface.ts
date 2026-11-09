import type { VenueUniverse } from "@/enums/venue-universe.enum";

/** `SaveCatalogCategoryRequest`: slug and parent are never sent; the backend owns them. */
export interface CatalogCategoryPayload {
  name: { en: string; ar: string };
  description: { en: string | null; ar: string | null };
  universe: VenueUniverse;
  sort_order: number;
  is_active: boolean;
}
