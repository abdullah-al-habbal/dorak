"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FormField } from "@/components/common/form-field";
import { ServiceTermsRow } from "@/components/stylists/service-terms-row";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { useBrandOptions } from "@/hooks/use-brand-options";
import { useI18n } from "@/hooks/use-i18n";
import { useClearServiceOverride, useSaveServiceOverride } from "@/hooks/use-service-override";
import { useStylistServiceTerms } from "@/hooks/use-stylist-service-terms";
import { localizedText } from "@/lib/booking-format.util";
import type { Stylist } from "@/types/stylists/stylist.type";

/** A brand owner's price and duration for a stylist's services, over the stylist's own defaults. */
export function StylistPricingDialog({ stylist, onClose }: { stylist: Stylist; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { stylistPricing: t } = dictionary;
  const brands = useBrandOptions();
  const [picked, setPicked] = useState<string>();
  const brandId = picked ?? brands.data?.[0]?.id ?? null;
  const terms = useStylistServiceTerms(stylist.id, brandId);
  const save = useSaveServiceOverride();
  const reset = useClearServiceOverride();
  const busy = save.isPending || reset.isPending;
  const items = terms.data ?? [];

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-xl">
        <DialogHeader>
          <DialogTitle dir="auto">{t.title.replace("{name}", localizedText(stylist.name, locale))}</DialogTitle>
          <DialogDescription>{t.description}</DialogDescription>
        </DialogHeader>
        {brands.data && brands.data.length > 1 ? (
          <FormField id="pricing-brand" label={t.brand}>
            <NativeSelect id="pricing-brand" value={brandId ?? ""} onChange={(event) => setPicked(event.target.value)}>
              {brands.data.map((brand) => (
                <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
              ))}
            </NativeSelect>
          </FormField>
        ) : null}
        <div aria-busy={terms.isFetching} className="flex flex-col gap-4">
          {brands.isPending || (brandId !== null && terms.isPending) ? <TableSkeleton /> : null}
          {brands.isError || terms.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => (terms.isError ? terms.refetch() : brands.refetch())} /> : null}
          {terms.data && items.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
          {items.length > 0 && brandId !== null ? (
            <ul aria-label={t.services} className="flex flex-col divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
              {items.map((entry) => (
                <ServiceTermsRow
                  key={`${entry.id}-${entry.price_amount_minor}-${entry.duration_minutes ?? ""}`}
                  terms={entry}
                  busy={busy}
                  onSave={(payload) => save.mutate({ barberId: stylist.id, serviceId: entry.id, payload: { ...payload, brand_id: brandId } })}
                  onReset={() => reset.mutate({ barberId: stylist.id, serviceId: entry.id, brandId })}
                />
              ))}
            </ul>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
