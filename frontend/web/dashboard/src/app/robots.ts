import type { MetadataRoute } from "next";
import { connection } from "next/server";

import { PUBLIC_SITE_URL_ENV, ROBOTS_DISALLOWED_PATHS } from "@/config/public-profile.constant";
import { absoluteUrl } from "@/lib/public/public-profile.util";

/**
 * Crawlers may read the public profiles and nothing else: the workspaces and the API stay out. Each profile
 * page also carries its own `index` or `noindex` robots tag, so a page that is hidden or unavailable is
 * never indexed even if a crawler finds the link. The sitemap is announced only when the site origin is known.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection();
  const origin = process.env[PUBLIC_SITE_URL_ENV]?.trim();
  return {
    rules: { userAgent: "*", allow: "/", disallow: [...ROBOTS_DISALLOWED_PATHS] },
    sitemap: origin ? absoluteUrl(origin, "/sitemap.xml") : undefined,
  };
}
