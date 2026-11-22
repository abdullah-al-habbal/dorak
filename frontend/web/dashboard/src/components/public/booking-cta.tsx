import type { JSX } from "react";

import { buttonVariants } from "@/components/ui/button";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

/** Booking happens in the Dorak app. With a configured app link the button opens it; otherwise the page says where to book. */
export function BookingCta({ appUrl, dictionary }: { appUrl: string | null; dictionary: Dictionary["publicProfile"] }): JSX.Element {
  const t = dictionary.cta;
  return (
    <section aria-label={t.title} className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-5">
      <h2 className="font-heading text-lg font-semibold">{t.title}</h2>
      <p className="text-sm text-muted-foreground">{appUrl ? t.body : t.noLink}</p>
      {appUrl ? <a href={appUrl} rel="noopener noreferrer" className={buttonVariants()}>{t.button}</a> : null}
    </section>
  );
}
