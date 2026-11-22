import type { JSX } from "react";

import { LinkCardList } from "@/components/public/link-card-list";
import { ProfileHero } from "@/components/public/profile-hero";
import { ProfileSection } from "@/components/public/profile-section";
import type { PublicProfileContext } from "@/components/public/public-profile-context";
import { PUBLIC_PROFILE_ROUTE } from "@/config/public-profile.constant";
import { pickText } from "@/lib/public/public-profile.util";
import type { PublicBrandProfile } from "@/types/public/public-profile.type";

export function BrandProfileScreen({ brand, context }: { brand: PublicBrandProfile; context: PublicProfileContext }): JSX.Element {
  const { locale, dictionary } = context;
  const t = dictionary.publicProfile;
  const description = pickText(brand.description, locale);
  return (
    <>
      <ProfileHero kind={t.kind.brand} title={pickText(brand.name, locale)} imageUrl={brand.logo_url} rating={{ average: null, count: 0 }} dictionary={t} locale={locale} />
      <ProfileSection title={t.about} empty={description ? undefined : t.empty.description}>
        <p className="whitespace-pre-line text-sm leading-relaxed">{description}</p>
      </ProfileSection>
      <ProfileSection title={t.branches} empty={brand.branches.length === 0 ? t.empty.branches : undefined}>
        <LinkCardList items={brand.branches.map((branch) => ({ href: PUBLIC_PROFILE_ROUTE.branch(branch.slug), title: pickText(branch.name, locale), subtitle: pickText(branch.address, locale) }))} />
      </ProfileSection>
    </>
  );
}
