import type { JSX } from "react";

import { BookingCta } from "@/components/public/booking-cta";
import { HoursList } from "@/components/public/hours-list";
import { LinkCardList } from "@/components/public/link-card-list";
import { ProfileHero } from "@/components/public/profile-hero";
import { ProfileSection } from "@/components/public/profile-section";
import type { PublicProfileContext } from "@/components/public/public-profile-context";
import { ServiceList } from "@/components/public/service-list";
import { Badge } from "@/components/ui/badge";
import { PUBLIC_PROFILE_ROUTE, PUBLIC_WEEK_START } from "@/config/public-profile.constant";
import { pickText } from "@/lib/public/public-profile.util";
import type { PublicBranchProfile } from "@/types/public/public-profile.type";

export function BranchProfileScreen({ branch, context, today }: { branch: PublicBranchProfile; context: PublicProfileContext; today: number }): JSX.Element {
  const { locale, dictionary, bookingUrl } = context;
  const t = dictionary.publicProfile;
  const description = pickText(branch.description, locale);
  const tags = branch.tags.map((tag) => pickText(tag, locale)).filter(Boolean);
  const brandName = branch.brand ? pickText(branch.brand.name, locale) : "";
  return (
    <>
      <ProfileHero
        kind={t.kind.branch}
        title={pickText(branch.name, locale)}
        subtitle={[pickText(branch.address, locale), brandName ? t.partOf.replace("{name}", brandName) : ""].filter(Boolean).join(" · ")}
        rating={{ average: branch.rating_average, count: branch.rating_count }}
        dictionary={t}
        locale={locale}
      />
      <BookingCta appUrl={bookingUrl} dictionary={t} />
      <ProfileSection title={t.about} empty={description ? undefined : t.empty.description}>
        <p className="whitespace-pre-line text-sm leading-relaxed">{description}</p>
      </ProfileSection>
      {tags.length > 0 ? (
        <ul aria-label={t.tags} className="flex flex-wrap gap-2">
          {tags.map((tag) => <li key={tag}><Badge variant="outline">{tag}</Badge></li>)}
        </ul>
      ) : null}
      <ProfileSection title={t.services} empty={branch.services.length === 0 ? t.empty.services : undefined}>
        <ServiceList services={branch.services} locale={locale} dictionary={dictionary} />
      </ProfileSection>
      <ProfileSection title={t.hours} empty={branch.opening_hours.length === 0 ? t.empty.hours : undefined}>
        <HoursList days={branch.opening_hours} weekStart={PUBLIC_WEEK_START[locale]} today={today} locale={locale} dictionary={t} />
      </ProfileSection>
      <ProfileSection title={t.stylists} empty={branch.stylists.length === 0 ? t.empty.stylists : undefined}>
        <LinkCardList items={branch.stylists.map((stylist) => ({ href: PUBLIC_PROFILE_ROUTE.stylist(stylist.slug), title: pickText(stylist.name, locale), subtitle: stylist.is_freelancer ? t.freelancer : undefined }))} />
      </ProfileSection>
    </>
  );
}
