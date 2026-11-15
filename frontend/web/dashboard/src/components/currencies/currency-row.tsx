"use client";

import type { JSX } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

interface CurrencyRowProps {
  currency: AdminCurrency;
  busy: boolean;
  onEdit: (currency: AdminCurrency) => void;
  onToggle: (currency: AdminCurrency, active: boolean) => void;
}

/** One currency. A retired currency stops being offered for new prices; the default can't be retired. */
export function CurrencyRow({ currency, busy, onEdit, onToggle }: CurrencyRowProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { currencies: t } = dictionary;
  const name = localizedText(currency.name, locale);

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span dir="ltr" className="tabular font-medium">{currency.code}</span>
          <span dir="auto" className="truncate text-muted-foreground">{name}</span>
        </span>
        <span className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span dir="ltr">{currency.symbol}</span>
          {currency.is_default ? <Badge variant="info">{t.default}</Badge> : null}
          {currency.is_active ? null : <Badge variant="outline">{t.retired}</Badge>}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Switch
          checked={currency.is_active}
          disabled={busy || (currency.is_default && currency.is_active)}
          aria-label={(currency.is_active ? t.retire : t.restore).replace("{code}", currency.code)}
          onCheckedChange={(checked) => onToggle(currency, checked)}
        />
        <Button type="button" size="sm" variant="outline" onClick={() => onEdit(currency)}>{t.edit}</Button>
      </div>
    </li>
  );
}
