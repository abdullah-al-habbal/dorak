import { PublicProfileKind } from "@/enums/public/public-profile-kind.enum";

/** Backend path of each public profile page (`/api/v1/public/...`), read-only and unauthenticated. */
export const PUBLIC_PROFILE_API_PREFIX = "/api/v1/public";

/** Where a visitor books: the Dorak app link. Optional; without it the page tells the visitor to use the app. */
export const BOOKING_APP_URL_ENV = "BOOKING_APP_URL";
/** Absolute origin of this site, for canonical and social-preview URLs. Optional. */
export const PUBLIC_SITE_URL_ENV = "PUBLIC_SITE_URL";

export const PUBLIC_PROFILE_ROUTE = {
  brand: (slug: string): string => `/${PublicProfileKind.Brand}/${slug}`,
  branch: (slug: string): string => `/${PublicProfileKind.Branch}/${slug}`,
  stylist: (slug: string): string => `/${PublicProfileKind.Stylist}/${slug}`,
} as const;

/** The description in a search or social preview is cut here. */
export const META_DESCRIPTION_MAX_LENGTH = 160;

/** The weekday a public hours table starts on (0 is Sunday). */
export const PUBLIC_WEEK_START = { en: 0, ar: 6 } as const;
