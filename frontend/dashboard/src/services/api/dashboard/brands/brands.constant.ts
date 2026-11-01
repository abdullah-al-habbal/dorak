import { VENUE_UNIVERSES } from "@/services/api/dashboard/shared/venue-universe.constant";
import type { IBrandForm } from "@/services/api/dashboard/brands/types/ibrand-form.types";

export const BRAND_UNIVERSES = VENUE_UNIVERSES;

export const BRAND_QUERY_KEYS = {
  list: ["dashboard", "brands"],
  lookups: ["lookups", "brands"],
} as const;

export const BRAND_SERVER_FIELD_MAP: Record<string, keyof IBrandForm> = {
  "name.en": "nameEn",
  "name.ar": "nameAr",
  "description.en": "descriptionEn",
  "description.ar": "descriptionAr",
  logo: "logo",
  base_currency_id: "baseCurrencyId",
  universe: "universe",
};
