// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import type { JSX } from "react";
import { describe, expect, it } from "vitest";

import "@tests/helpers/dom.helper";
import { BranchProfileScreen } from "@/components/public/branch-profile-screen";
import { BrandProfileScreen } from "@/components/public/brand-profile-screen";
import type { PublicProfileContext } from "@/components/public/public-profile-context";
import { StylistProfileScreen } from "@/components/public/stylist-profile-screen";
import { Locale } from "@/enums/access/locale.enum";
import { DICTIONARIES } from "@/locales/dictionaries.constant";
import type { PublicBranchProfile, PublicBrandProfile, PublicStylistProfile } from "@/types/public/public-profile.type";

const NAME = { en: "Royal Cuts", ar: "رويال كتس" };
const ADDRESS = { en: "Main Street", ar: "الشارع الرئيسي" };
const SERVICE = { name: { en: "Fade", ar: "تدريج" }, price_amount_minor: 5000, currency_code: "USD", duration_minutes: 30, is_at_home: false };
const DAYS = [0, 1, 2, 3, 4, 5, 6].map((day) => ({ day_of_week: day, is_closed: day === 5, shifts: day === 5 ? [] : [{ opens_time: "09:00:00", closes_time: "17:00:00" }] }));
const STYLIST = { slug: "omar", name: { en: "Omar", ar: "عمر" }, is_freelancer: false, rating_average: 4.5, rating_count: 3 };

const BRAND: PublicBrandProfile = { slug: "royal", name: NAME, description: { en: "About us", ar: "من نحن" }, logo_url: null, branches: [{ slug: "main", name: NAME, address: ADDRESS, rating_average: null, rating_count: 0 }] };
const BRANCH: PublicBranchProfile = {
  slug: "main", name: NAME, description: { en: "About us", ar: "من نحن" }, address: ADDRESS, tags: [{ en: "Kids", ar: "أطفال" }], latitude: 33.5, longitude: 36.3,
  brand: { slug: "royal", name: NAME }, stylists: [STYLIST], services: [SERVICE], opening_hours: DAYS, rating_average: 4.2, rating_count: 10,
};
const OMAR: PublicStylistProfile = {
  slug: "omar", name: STYLIST.name, bio: { en: "Fades and beards", ar: "تدريج ولحى" }, is_freelancer: false, portfolio: [], services: [SERVICE],
  workplaces: [{ type: "branch", slug: "main", name: NAME }], rating_average: 4.5, rating_count: 3,
};

function contextOf(locale: Locale): PublicProfileContext {
  return { locale, dictionary: DICTIONARIES[locale], bookingUrl: null };
}

function screens(locale: Locale): Record<string, JSX.Element> {
  const context = contextOf(locale);
  return {
    brand: <BrandProfileScreen brand={BRAND} context={context} />,
    branch: <BranchProfileScreen branch={BRANCH} context={context} today={1} />,
    stylist: <StylistProfileScreen stylist={OMAR} context={context} />,
  };
}

describe.each([Locale.En, Locale.Ar])("public profile screens in %s", (locale) => {
  const expectedName = locale === Locale.Ar ? NAME.ar : NAME.en;

  it.each(["brand", "branch", "stylist"])("renders the %s page with the page language and one h1", (kind) => {
    const { container } = render(screens(locale)[kind]);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(container).toHaveTextContent(kind === "stylist" ? (locale === Locale.Ar ? "عمر" : "Omar") : expectedName);
    expect(container).not.toHaveTextContent(locale === Locale.Ar ? "About us" : "من نحن");
  });

  it.each(["brand", "branch", "stylist"])("uses logical direction classes only on the %s page, so the document dir flips it", (kind) => {
    const { container } = render(screens(locale)[kind]);
    expect(container.innerHTML).not.toMatch(/class="[^"]*\b(ml-|mr-|pl-|pr-|left-|right-|text-left|text-right|float-left|float-right)/);
  });

  it("keeps opening times left-to-right inside a right-to-left page", () => {
    const { container } = render(screens(locale).branch);
    const times = container.querySelectorAll("dd[dir='ltr']");
    expect(times.length).toBe(7);
    expect(times[0]).toHaveTextContent(/\d{2}:\d{2}.\d{2}:\d{2}|Closed|مغلق/);
  });
});
