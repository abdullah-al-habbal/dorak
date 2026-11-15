"use client";

import type { JSX, ReactNode } from "react";

import { BrandStatusBadge } from "@/components/admin-brands/brand-status-badge";
import { VenueUniverse } from "@/enums/venue-universe.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

function Field({ label, children }: { label: string; children: ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-words text-sm">{children}</dd>
    </div>
  );
}

function translation(value: AdminBrand["name"], locale: string): string {
  if (!value || typeof value === "string") return value ?? "";
  return value[locale] ?? "";
}

/** Every `BrandResource` field the admin needs before approving. Server strings render as text. */
export function BrandDetailFields({ brand }: { brand: AdminBrand }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminBrands: t, branches } = dictionary;
  const none = t.none;
  const universe = Object.values(VenueUniverse).find((value) => value === brand.universe);
  const created = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(brand.created_at));

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      <Field label={t.detail.nameEn}><span dir="auto">{translation(brand.name, "en") || none}</span></Field>
      <Field label={t.detail.nameAr}><span dir="auto">{translation(brand.name, "ar") || none}</span></Field>
      <Field label={t.detail.status}><BrandStatusBadge status={brand.status} /></Field>
      <Field label={t.detail.owner}><span dir="ltr" translate="no">{brand.owner?.email ?? none}</span></Field>
      <Field label={t.detail.currency}><span dir="ltr" translate="no">{brand.base_currency?.code ?? none}</span></Field>
      <Field label={t.detail.universe}>{universe ? branches.universe[universe] : none}</Field>
      <Field label={t.detail.branches}><span className="tabular">{brand.branches_count ?? none}</span></Field>
      <Field label={t.detail.created}><span className="tabular">{created}</span></Field>
      <Field label={t.detail.slug}><span dir="ltr" translate="no">{brand.slug ?? none}</span></Field>
      {brand.status_reason ? (
        <div className="sm:col-span-2">
          <Field label={t.detail.statusReason}><span dir="auto">{brand.status_reason}</span></Field>
        </div>
      ) : null}
      <Field label={t.detail.submissions}>
        <span className="tabular">{brand.submission_count ?? none}{brand.max_submissions ? ` / ${brand.max_submissions}` : ""}</span>
      </Field>
      <div className="sm:col-span-2">
        <Field label={t.detail.descriptionLabel}><span dir="auto">{localizedText(brand.description, locale) || none}</span></Field>
      </div>
    </dl>
  );
}
