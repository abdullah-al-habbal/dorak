import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { Locale } from "@/enums/access/locale.enum";

const fetches = vi.hoisted(() => ({ brand: vi.fn(), branch: vi.fn(), stylist: vi.fn() }));
const localeRef = vi.hoisted(() => ({ value: "en" as "en" | "ar" }));

vi.mock("next/server", () => ({ connection: async (): Promise<void> => {} }));
vi.mock("next/navigation", () => ({ notFound: (): never => { throw new Error("NEXT_NOT_FOUND"); } }));
vi.mock("@/components/public/public-profile-context", async () => {
  const { DICTIONARIES: dictionaries } = await import("@/locales/dictionaries.constant");
  return { readPublicProfileContext: async () => ({ locale: localeRef.value, dictionary: dictionaries[localeRef.value], bookingUrl: null }) };
});
vi.mock("@/services/api/public/public-profile", () => ({ fetchPublicBrand: fetches.brand, fetchPublicBranch: fetches.branch, fetchPublicStylist: fetches.stylist }));

const NAME = { en: "Royal Cuts", ar: "رويال كتس" };
const TEXT = { en: "Fades and beards", ar: "تدريج ولحى" };
const PAGES = [
  { kind: "brands", fetch: fetches.brand, profile: { slug: "royal", name: NAME, description: TEXT, logo_url: "https://cdn.example/logo.png", branches: [] } },
  { kind: "branches", fetch: fetches.branch, profile: { slug: "royal", name: NAME, description: TEXT, address: TEXT, tags: [], brand: null, stylists: [], services: [], opening_hours: [] } },
  { kind: "stylists", fetch: fetches.stylist, profile: { slug: "royal", name: NAME, bio: TEXT, is_freelancer: false, portfolio: [], services: [], workplaces: [] } },
] as const;

async function metadataOf(kind: string): Promise<Record<string, unknown>> {
  const page = await import(`@/app/${kind}/[slug]/page`);
  return page.generateMetadata({ params: Promise.resolve({ slug: "royal" }) });
}

const COLD_IMPORT_TIMEOUT_MS = 30_000;

// The first import of a page pulls in its whole module graph, which exceeds the default 5 s test timeout on a
// cold cache or a loaded machine (TD-16). Loading the pages here keeps that cost out of the first test.
beforeAll(async () => {
  await Promise.all(PAGES.map(({ kind }) => import(`@/app/${kind}/[slug]/page`)));
}, COLD_IMPORT_TIMEOUT_MS);

beforeEach(() => {
  vi.stubEnv("PUBLIC_SITE_URL", "https://dorak.example");
  localeRef.value = Locale.En;
});
afterEach(() => vi.unstubAllEnvs());

describe.each(PAGES)("$kind generateMetadata", ({ kind, fetch, profile }) => {
  it("indexes a found profile with a canonical URL and the page language", async () => {
    fetch.mockResolvedValue({ status: "found", profile });
    const meta = await metadataOf(kind);
    expect(meta).toMatchObject({
      title: "Royal Cuts",
      robots: { index: true, follow: true },
      alternates: { canonical: `https://dorak.example/${kind}/royal` },
      openGraph: { locale: "en" },
    });
  });

  it("titles and describes the page in Arabic", async () => {
    localeRef.value = Locale.Ar;
    fetch.mockResolvedValue({ status: "found", profile });
    const meta = await metadataOf(kind);
    expect(meta).toMatchObject({ title: "رويال كتس", description: "تدريج ولحى", openGraph: { locale: "ar" } });
  });

  it.each(["unavailable", "not-found"])("adds nothing for %s, so the private default (noindex) and site title stay", async (status) => {
    fetch.mockResolvedValue({ status });
    expect(await metadataOf(kind)).toEqual({});
  });
});
