import type { JSX, ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/enums/access/locale.enum";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

interface ProfileHeroProps {
  kind: string;
  title: string;
  subtitle?: string;
  /** Decorative or identifying image: a logo or the first portfolio photo. */
  imageUrl?: string | null;
  rating: { average: number | null; count: number };
  dictionary: Dictionary["publicProfile"];
  locale: Locale;
  children?: ReactNode;
}

function ratingText({ average, count }: ProfileHeroProps["rating"], t: Dictionary["publicProfile"], locale: Locale): string {
  if (average === null || count === 0) return t.noRatings;
  return t.rating.replace("{rating}", average.toLocaleString(locale, { maximumFractionDigits: 1 })).replace("{count}", String(count));
}

/** Name, kind badge, rating and image at the top of a profile. The one `h1` of the page. */
export function ProfileHero({ kind, title, subtitle, imageUrl, rating, dictionary, locale, children }: ProfileHeroProps): JSX.Element {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- a brand logo from the API's public disk, not in the Next image pipeline */}
      {imageUrl ? <img src={imageUrl} alt="" loading="eager" width={96} height={96} className="size-24 shrink-0 rounded-xl bg-muted object-cover" /> : null}
      <div className="flex min-w-0 flex-col gap-2">
        <Badge variant="secondary">{kind}</Badge>
        <h1 className="font-heading text-2xl font-semibold text-balance sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        <p className="text-sm text-muted-foreground">{ratingText(rating, dictionary, locale)}</p>
        {children}
      </div>
    </section>
  );
}
