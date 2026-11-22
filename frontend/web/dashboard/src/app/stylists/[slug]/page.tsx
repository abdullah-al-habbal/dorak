import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { ProfileUnavailable } from "@/components/public/profile-unavailable";
import { readPublicProfileContext } from "@/components/public/public-profile-context";
import { PublicProfileShell } from "@/components/public/public-profile-shell";
import { StylistProfileScreen } from "@/components/public/stylist-profile-screen";
import { PUBLIC_PROFILE_ROUTE } from "@/config/public-profile.constant";
import { buildProfileMetadata } from "@/lib/public/public-profile-metadata.util";
import { pickText } from "@/lib/public/public-profile.util";
import { fetchPublicStylist } from "@/services/api/public/public-profile";

const loadStylist = cache(fetchPublicStylist);

export async function generateMetadata({ params }: PageProps<"/stylists/[slug]">): Promise<Metadata> {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadStylist(slug);
  if (result.status !== "found") return {};
  const name = pickText(result.profile.name, context.locale);
  return buildProfileMetadata({
    title: name,
    description: pickText(result.profile.bio, context.locale) || context.dictionary.publicProfile.metaFallback.replace("{name}", name),
    path: PUBLIC_PROFILE_ROUTE.stylist(slug),
    locale: context.locale,
    imageUrl: result.profile.portfolio[0]?.url,
  });
}

export default async function StylistProfilePage({ params }: PageProps<"/stylists/[slug]">) {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadStylist(slug);
  if (result.status === "not-found") notFound();
  return (
    <PublicProfileShell dictionary={context.dictionary}>
      {result.status === "found" ? <StylistProfileScreen stylist={result.profile} context={context} /> : <ProfileUnavailable dictionary={context.dictionary.publicProfile} />}
    </PublicProfileShell>
  );
}
