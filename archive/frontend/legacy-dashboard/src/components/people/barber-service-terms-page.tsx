"use client";

import { BarberServiceTermsRow } from "@/components/people/barber-service-terms-row";
import { useBarberServiceTermsQuery } from "@/hooks/use-barber-service-terms-query";
import { useDashboardListOptions } from "@/hooks/use-dashboard-list-options";
import { useDictionary } from "@/hooks/use-dictionary";
import { useI18n } from "@/hooks/use-i18n";
import { apiErrorMessage } from "@/services/api/core/api-error-message.util";
import { mapBrand } from "@/services/api/dashboard/brands/brands.mapper.util";
import { ROUTES } from "@/config/routes.constant";
import Link from "next/link";
import { useState } from "react";

interface IBarberServiceTermsPageProps {
  actor: "admin" | "owner";
  barberId: string;
}

const BRAND_OPTIONS_PAGE_SIZE = 100;

export function BarberServiceTermsPage({
  actor,
  barberId,
}: IBarberServiceTermsPageProps) {
  const dictionary = useDictionary();
  const copy = dictionary.barberServiceTerms;
  const { locale } = useI18n();
  const brands = useDashboardListOptions("brands", mapBrand, {
    page: 1,
    perPage: BRAND_OPTIONS_PAGE_SIZE,
    keySuffix: "service-terms",
  });
  const [chosenBrandId, setChosenBrandId] = useState<string>("");
  const brandId = chosenBrandId || brands.data?.[0]?.id;
  const terms = useBarberServiceTermsQuery(barberId, brandId);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-title-50">{copy.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-text-secondary">
            {copy.description}
          </p>
        </div>
        <Link
          className="rounded-lg border border-button-primary-outline-stroke px-4 py-2 text-sm text-button-primary-outline-text"
          href={`${ROUTES.operations.resource(actor, "stylists")}/${encodeURIComponent(barberId)}`}
        >
          {copy.backToStylist}
        </Link>
      </div>
      {brands.data?.length === 0 ? (
        <p className="text-text-secondary">{copy.noBrands}</p>
      ) : (
        <label className="grid max-w-sm gap-1 text-sm text-text-100">
          <span>{copy.brand}</span>
          <select
            className="rounded-lg border border-card-border bg-input-background px-4 py-2.5"
            value={brandId ?? ""}
            onChange={(event) => setChosenBrandId(event.target.value)}
          >
            <option value="" disabled>
              {copy.selectBrand}
            </option>
            {brands.data?.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name[locale]}
              </option>
            ))}
          </select>
        </label>
      )}
      {terms.isPending && brandId !== undefined ? (
        <p className="text-text-secondary">{copy.loading}</p>
      ) : null}
      {terms.isError ? (
        <p className="text-input-error-focus-border" role="alert">
          {apiErrorMessage(terms.error, dictionary)}
        </p>
      ) : null}
      {terms.data?.length === 0 ? (
        <p className="text-text-secondary">{copy.empty}</p>
      ) : null}
      <ul className="space-y-3">
        {brandId === undefined
          ? null
          : terms.data?.map((item) => (
              <BarberServiceTermsRow
                key={`${brandId}-${item.id}-${item.isOverridden}-${item.priceAmountMinor}-${item.durationMinutes}`}
                barberId={barberId}
                brandId={brandId}
                terms={item}
              />
            ))}
      </ul>
    </section>
  );
}
