import type { Metadata } from "next";

import { PUBLIC_SITE_URL_ENV } from "@/config/public-profile.constant";
import type { Locale } from "@/enums/access/locale.enum";
import { absoluteUrl, metaDescription } from "@/lib/public/public-profile.util";

interface ProfileMetadataInput {
  title: string;
  description: string;
  path: string;
  locale: Locale;
  imageUrl?: string | null;
}

/** Search and social-preview tags of a public profile. Unlike the private dashboard, these pages may be indexed. */
export function buildProfileMetadata({ title, description, path, locale, imageUrl }: ProfileMetadataInput): Metadata {
  const url = absoluteUrl(process.env[PUBLIC_SITE_URL_ENV], path);
  const text = metaDescription(description);
  return {
    title,
    description: text,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: { type: "profile", title, description: text, url, locale, images: imageUrl ? [{ url: imageUrl }] : undefined },
    twitter: { card: imageUrl ? "summary_large_image" : "summary", title, description: text, images: imageUrl ? [imageUrl] : undefined },
  };
}
