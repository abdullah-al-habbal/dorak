import Link from "next/link";
import { PageCard } from "@/components/common/layout/page-card";
import { getPublicPortalLinks } from "@/config/routes.util";
import { getServerI18n } from "@/i18n/server";

export async function LandingPage() {
  const { dictionary } = await getServerI18n();
  const portalLinks = getPublicPortalLinks(dictionary);

  return (
    <PageCard size="lg">
      <p className="text-sm font-medium text-text-tertiary">{dictionary.public.eyebrow}</p>
      <h1 className="mt-3 max-w-2xl text-3xl font-semibold text-text-primary sm:text-5xl">
        {dictionary.public.title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
        {dictionary.public.description}
      </p>
      <nav aria-label={dictionary.public.portalNavigationLabel} className="mt-8 grid gap-3 sm:grid-cols-3">
        {portalLinks.map((portal) => (
          <Link
            key={portal.href}
            href={portal.href}
            className="rounded-xl border border-card-border px-4 py-3 text-center text-sm font-medium text-text-primary transition-colors hover:bg-background-gray-secondary_alt"
          >
            {portal.label}
          </Link>
        ))}
      </nav>
    </PageCard>
  );
}
