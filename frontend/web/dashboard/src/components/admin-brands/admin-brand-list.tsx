"use client";

import { CheckIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { BrandStatusBadge } from "@/components/admin-brands/brand-status-badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/table/data-table";
import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data/data-table-column.interface";
import { localizedText } from "@/lib/core/format/booking-format.util";
import type { AdminBrand } from "@/types/brands/admin-brand.type";

interface AdminBrandListProps {
  brands: readonly AdminBrand[];
  onSelect: (brand: AdminBrand) => void;
  onApprove: (brand: AdminBrand) => void;
}

function getBrandId(brand: AdminBrand): string {
  return brand.id;
}

export function AdminBrandList({ brands, onSelect, onApprove }: AdminBrandListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { adminBrands: t } = dictionary;
  const rowLabel = (brand: AdminBrand) => t.rowLabel.replace("{brand}", localizedText(brand.name, locale));

  const columns = useMemo<DataTableColumn<AdminBrand>[]>(() => {
    const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
    return [
      { id: "brand", header: t.columns.brand, primary: true, cell: (brand) => <span dir="auto" className="truncate font-medium">{localizedText(brand.name, locale) || t.none}</span> },
      { id: "owner", header: t.columns.owner, cell: (brand) => <span dir="ltr" translate="no" className="truncate text-muted-foreground">{brand.owner?.email ?? t.none}</span> },
      { id: "branches", header: t.columns.branches, cell: (brand) => <span className="tabular">{brand.branches_count ?? t.none}</span> },
      { id: "status", header: t.columns.status, cell: (brand) => <BrandStatusBadge status={brand.status} /> },
      { id: "created", header: t.columns.created, cell: (brand) => <span className="tabular text-sm text-muted-foreground">{date.format(new Date(brand.created_at))}</span> },
      {
        id: "actions",
        header: t.columns.actions,
        interactive: true,
        align: "end",
        cell: (brand) =>
          brand.status === BrandStatus.Pending ? (
            <Button size="sm" aria-label={t.rowAction.replace("{brand}", localizedText(brand.name, locale))} onClick={() => onApprove(brand)}>
              <CheckIcon aria-hidden data-icon="inline-start" />
              {t.approve}
            </Button>
          ) : null,
      },
    ];
  }, [locale, onApprove, t]);

  return <DataTable caption={t.title} columns={columns} rows={brands} getRowId={getBrandId} onRowSelect={onSelect} rowLabel={rowLabel} />;
}
