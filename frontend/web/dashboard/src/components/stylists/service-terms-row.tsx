"use client";

import { useState } from "react";
import type { JSX } from "react";

import { FormField } from "@/components/common/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText, formatPrice } from "@/lib/booking-format.util";
import { draftFromTerms, draftToPayload } from "@/lib/service-override.util";
import type { ServiceOverridePayload } from "@/services/api/mutation/stylist-pricing.mutation";
import type { ServiceTerms } from "@/types/services/service-terms.type";

interface ServiceTermsRowProps {
  terms: ServiceTerms;
  busy: boolean;
  onSave: (payload: Omit<ServiceOverridePayload, "brand_id">) => void;
  onReset: () => void;
}

/** One service: the barber's default beside the brand's price and duration, with save and reset. */
export function ServiceTermsRow({ terms, busy, onSave, onReset }: ServiceTermsRowProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { stylistPricing: t } = dictionary;
  const [draft, setDraft] = useState(draftFromTerms(terms));
  const [error, setError] = useState<string>();
  const defaultPrice = formatPrice(terms.default_price_amount_minor ?? terms.price_amount_minor, terms.currency_code, locale);
  const defaultDuration = terms.default_duration_minutes ?? terms.duration_minutes;
  const priceId = `terms-price-${terms.id}`;
  const durationId = `terms-duration-${terms.id}`;

  function save(): void {
    const result = draftToPayload(draft, terms);
    if ("error" in result) {
      setError(result.error === "invalid" ? t.invalid : t.nothing);
      return;
    }
    setError(undefined);
    onSave(result.payload);
  }

  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span dir="auto" className="font-medium">{localizedText(terms.name, locale)}</span>
        {terms.is_overridden ? <Badge variant="info">{t.overridden}</Badge> : <Badge variant="outline">{t.default}</Badge>}
      </div>
      <p className="text-sm text-muted-foreground">
        {t.defaultTerms.replace("{price}", defaultPrice).replace("{duration}", defaultDuration == null ? "-" : String(defaultDuration))}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <FormField id={priceId} label={t.price.replace("{currency}", terms.currency_code)}>
          <Input id={priceId} inputMode="decimal" dir="ltr" autoComplete="off" value={draft.price} onChange={(event) => setDraft({ ...draft, price: event.target.value })} />
        </FormField>
        <FormField id={durationId} label={t.duration}>
          <Input id={durationId} inputMode="numeric" dir="ltr" autoComplete="off" value={draft.duration} onChange={(event) => setDraft({ ...draft, duration: event.target.value })} />
        </FormField>
      </div>
      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" disabled={busy} onClick={save}>{t.save}</Button>
        {terms.is_overridden ? <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onReset}>{t.reset}</Button> : null}
      </div>
    </li>
  );
}
