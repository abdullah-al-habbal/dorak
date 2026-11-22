import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/enums/access/locale.enum";
import { formatPrice } from "@/lib/core/format/booking-format.util";
import { formatDuration } from "@/lib/services/service-format.util";
import { pickText } from "@/lib/public/public-profile.util";
import type { Dictionary } from "@/types/core/shared/dictionary.type";
import type { PublicService } from "@/types/public/public-profile.type";

interface ServiceListProps {
  services: readonly PublicService[];
  locale: Locale;
  dictionary: Dictionary;
}

/** The bookable menu: name, optional description, duration and price per row. */
export function ServiceList({ services, locale, dictionary }: ServiceListProps): JSX.Element {
  const t = dictionary.publicProfile;
  return (
    <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {services.map((service, index) => {
        const description = pickText(service.description, locale);
        const price = service.price_amount_minor === 0 ? t.free : formatPrice(service.price_amount_minor, service.currency_code, locale);
        return (
          <li key={`${pickText(service.name, locale)}-${index}`} className="flex items-start justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="font-medium">{pickText(service.name, locale)}</span>
              {description ? <span className="text-sm text-muted-foreground">{description}</span> : null}
              <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {service.duration_minutes ? <span>{formatDuration(service.duration_minutes, dictionary)}</span> : null}
                {service.is_at_home ? <Badge variant="secondary">{t.atHome}</Badge> : null}
              </span>
            </div>
            <span className="tabular shrink-0 font-medium">{price}</span>
          </li>
        );
      })}
    </ul>
  );
}
