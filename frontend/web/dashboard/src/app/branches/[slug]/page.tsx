import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";

import { BranchProfileScreen } from "@/components/public/branch-profile-screen";
import { ProfileUnavailable } from "@/components/public/profile-unavailable";
import { readPublicProfileContext } from "@/components/public/public-profile-context";
import { PublicProfileShell } from "@/components/public/public-profile-shell";
import { PUBLIC_PROFILE_ROUTE } from "@/config/public-profile.constant";
import { buildProfileMetadata } from "@/lib/public/public-profile-metadata.util";
import { pickText } from "@/lib/public/public-profile.util";
import { fetchPublicBranch } from "@/services/api/public/public-profile";

const loadBranch = cache(fetchPublicBranch);

export async function generateMetadata({ params }: PageProps<"/branches/[slug]">): Promise<Metadata> {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadBranch(slug);
  if (result.status !== "found") return {};
  const name = pickText(result.profile.name, context.locale);
  return buildProfileMetadata({
    title: name,
    description: pickText(result.profile.description, context.locale) || pickText(result.profile.address, context.locale) || context.dictionary.publicProfile.metaFallback.replace("{name}", name),
    path: PUBLIC_PROFILE_ROUTE.branch(slug),
    locale: context.locale,
  });
}

export default async function BranchProfilePage({ params }: PageProps<"/branches/[slug]">) {
  await connection();
  const [{ slug }, context] = await Promise.all([params, readPublicProfileContext()]);
  const result = await loadBranch(slug);
  if (result.status === "not-found") notFound();
  return (
    <PublicProfileShell dictionary={context.dictionary}>
      {result.status === "found" ? <BranchProfileScreen branch={result.profile} context={context} today={new Date().getDay()} /> : <ProfileUnavailable dictionary={context.dictionary.publicProfile} />}
    </PublicProfileShell>
  );
}
