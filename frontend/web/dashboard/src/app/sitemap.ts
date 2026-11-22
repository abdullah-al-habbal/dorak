import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { PUBLIC_PROFILE_ROUTE, PUBLIC_SITE_URL_ENV } from "@/config/public-profile.constant";
import { absoluteUrl } from "@/lib/public/public-profile.util";
import { fetchPublicSitemap } from "@/services/api/public/public-profile";

type Entry = MetadataRoute.Sitemap[number];

function entriesOf(origin: string, rows: readonly { slug: string; updated_at: string | null }[], route: (slug: string) => string): Entry[] {
  return rows.map((row) => ({ url: absoluteUrl(origin, route(row.slug)), lastModified: row.updated_at ?? undefined }));
}

/**
 * Every indexable public profile, read live from the backend (which applies the same visibility rules as the
 * profile pages, so a hidden or unavailable page is never listed). Sitemap URLs must be absolute: without
 * `PUBLIC_SITE_URL`, or when the backend is down, the sitemap is empty rather than wrong.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const origin = process.env[PUBLIC_SITE_URL_ENV]?.trim();
  if (!origin) return [];
  const feed = await fetchPublicSitemap();
  if (!feed) return [];
  return [
    ...entriesOf(origin, feed.brands, PUBLIC_PROFILE_ROUTE.brand),
    ...entriesOf(origin, feed.branches, PUBLIC_PROFILE_ROUTE.branch),
    ...entriesOf(origin, feed.stylists, PUBLIC_PROFILE_ROUTE.stylist),
  ];
}
