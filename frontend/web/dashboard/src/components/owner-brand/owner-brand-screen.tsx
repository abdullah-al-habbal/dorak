"use client";

import { PencilIcon, PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { BrandStatusBadge } from "@/components/admin-brands/brand-status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { BrandStatus } from "@/enums/brand-status.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useOwnerBrands } from "@/hooks/use-owner-brands";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

/** The owner's brands: edit the profile, add another brand. A suspended brand can't be edited (the platform team lifts that). */
export function OwnerBrandScreen(): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { ownerBrand: t } = dictionary;
  const overlay = useOverlay();
  const query = useOwnerBrands();
  const brands = query.data ?? [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
          <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
        </div>
        <Button type="button" onClick={() => overlay.open({ kind: OverlayKind.BrandCreate })}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.add}
        </Button>
      </div>
      {query.isPending ? <TableSkeleton /> : null}
      {query.isError ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
      {query.data && brands.length === 0 ? <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} /> : null}
      <ul className="flex flex-col gap-3">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} localizedName={localizedText(brand.name, locale)} />
        ))}
      </ul>
    </div>
  );
}

function BrandCard({ brand, localizedName }: { brand: AdminBrand; localizedName: string }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { ownerBrand: t } = dictionary;
  const overlay = useOverlay();
  const description = localizedText(brand.description, locale);

  return (
    <li className="flex flex-col gap-3 rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 dir="auto" className="font-heading text-xl font-semibold">{localizedName}</h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <BrandStatusBadge status={brand.status} />
            {brand.base_currency ? <span className="tabular">{brand.base_currency.code}</span> : null}
            {typeof brand.branches_count === "number" ? <span className="tabular">{t.branches.replace("{count}", String(brand.branches_count))}</span> : null}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          disabled={brand.status === BrandStatus.Suspended}
          onClick={() => overlay.open({ kind: OverlayKind.BrandEdit, brand })}
        >
          <PencilIcon aria-hidden data-icon="inline-start" />
          {t.edit}
        </Button>
      </div>
      {description ? <p dir="auto" className="break-words text-sm text-muted-foreground">{description}</p> : null}
      {brand.status !== BrandStatus.Active ? <p className="text-sm text-muted-foreground">{t.notActive}</p> : null}
    </li>
  );
}
