import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { BrandProfileScreen } from "@/components/public/brand-profile-screen";
import { ProfileUnavailable } from "@/components/public/profile-unavailable";
import { readPublicProfileContext } from "@/components/public/public-profile-context";
import { PublicProfileShell } from "@/components/public/public-profile-shell";
import { PUBLIC_PROFILE_ROUTE } from "@/config/public-profile.constant";
import { buildProfileMetadata } from "@/lib/public/public-profile-metadata.util";
import { pickText } from "@/lib/public/public-profile.util";
import { fetchPublicBrand } from "@/services/api/public/public-profile";

const loadBrand = cache(fetchPublicBrand);

export async function generateMetadata({ params }: PageProps<"/brands/[slug]">): Promise<Metadata> {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadBrand(slug);
  if (result.status !== "found") return {};
  const name = pickText(result.profile.name, context.locale);
  return buildProfileMetadata({
    title: name,
    description: pickText(result.profile.description, context.locale) || context.dictionary.publicProfile.metaFallback.replace("{name}", name),
    path: PUBLIC_PROFILE_ROUTE.brand(slug),
    locale: context.locale,
    imageUrl: result.profile.logo_url,
  });
}

export default async function BrandProfilePage({ params }: PageProps<"/brands/[slug]">) {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadBrand(slug);
  if (result.status === "not-found") notFound();
  return (
    <PublicProfileShell dictionary={context.dictionary}>
      {result.status === "found" ? <BrandProfileScreen brand={result.profile} context={context} /> : <ProfileUnavailable dictionary={context.dictionary.publicProfile} />}
    </PublicProfileShell>
  );
}
