import type { JSX } from "react";

import { BookingCta } from "@/components/public/booking-cta";
import { LinkCardList } from "@/components/public/link-card-list";
import { PortfolioGrid } from "@/components/public/portfolio-grid";
import { ProfileHero } from "@/components/public/profile-hero";
import { ProfileSection } from "@/components/public/profile-section";
import type { PublicProfileContext } from "@/components/public/public-profile-context";
import { ServiceList } from "@/components/public/service-list";
import { PUBLIC_PROFILE_ROUTE } from "@/config/public-profile.constant";
import { pickText } from "@/lib/public/public-profile.util";
import type { PublicStylistProfile } from "@/types/public/public-profile.type";

export function StylistProfileScreen({ stylist, context }: { stylist: PublicStylistProfile; context: PublicProfileContext }): JSX.Element {
  const { locale, dictionary, bookingUrl } = context;
  const t = dictionary.publicProfile;
  const name = pickText(stylist.name, locale);
  const bio = pickText(stylist.bio, locale);
  return (
    <>
      <ProfileHero kind={t.kind.stylist} title={name} subtitle={stylist.is_freelancer ? t.freelancer : undefined} imageUrl={stylist.portfolio[0]?.url} rating={{ average: stylist.rating_average, count: stylist.rating_count }} dictionary={t} locale={locale} />
      <BookingCta appUrl={bookingUrl} dictionary={t} />
      <ProfileSection title={t.about} empty={bio ? undefined : t.empty.description}>
        <p className="whitespace-pre-line text-sm leading-relaxed">{bio}</p>
      </ProfileSection>
      <ProfileSection title={t.services} empty={stylist.services.length === 0 ? t.empty.services : undefined}>
        <ServiceList services={stylist.services} locale={locale} dictionary={dictionary} />
      </ProfileSection>
      {stylist.workplaces.length > 0 ? (
        <ProfileSection title={t.workplaces}>
          <LinkCardList items={stylist.workplaces.map((place) => ({ href: place.type === "branch" ? PUBLIC_PROFILE_ROUTE.branch(place.slug) : PUBLIC_PROFILE_ROUTE.brand(place.slug), title: pickText(place.name, locale) }))} />
        </ProfileSection>
      ) : null}
      <ProfileSection title={t.portfolio} empty={stylist.portfolio.length === 0 ? t.empty.portfolio : undefined}>
        <PortfolioGrid photos={stylist.portfolio} label={name} />
      </ProfileSection>
    </>
  );
}
