"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { BranchLifecycleActions } from "@/components/branches/branch-lifecycle-actions";
import { BranchStatusBadge } from "@/components/branches/branch-status-badge";
import { DataTable } from "@/components/ui/table/data-table";
import type { AuthActor } from "@/enums/auth-actor.enum";
import { useI18n } from "@/hooks/use-i18n";
import type { DataTableColumn } from "@/interfaces/ui/data-table-column.interface";
import { localizedText } from "@/lib/booking-format.util";
import type { Branch } from "@/types/branches/branch.type";

interface BranchListProps {
  branches: readonly Branch[];
  /** Resolves a brand id to its name; the brand column shows only when the account sees several brands. */
  brandLabel: (id: string) => string;
  showBrand: boolean;
  onSelect: (branch: Branch) => void;
  actor: AuthActor;
}

function getBranchId(branch: Branch): string {
  return branch.id;
}

export function BranchList({ branches, brandLabel, showBrand, onSelect, actor }: BranchListProps): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { branches: t } = dictionary;
  const ratingFormat = useMemo(() => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }), [locale]);

  const columns = useMemo<DataTableColumn<Branch>[]>(() => {
    const base: DataTableColumn<Branch>[] = [
      { id: "name", header: t.columns.name, primary: true, cell: (branch) => <span dir="auto" className="truncate font-medium">{localizedText(branch.name, locale)}</span> },
      { id: "email", header: t.columns.email, cell: (branch) => <span dir="ltr" className="truncate text-muted-foreground">{branch.email ?? t.none}</span> },
      { id: "universe", header: t.columns.universe, cell: (branch) => <span className="text-muted-foreground">{branch.universe ? t.universe[branch.universe] : t.none}</span> },
      {
        id: "rating",
        header: t.columns.rating,
        cell: (branch) => (
          <span className="tabular text-muted-foreground">
            {branch.rating_average === null || branch.rating_average === undefined
              ? t.noRating
              : t.rating.replace("{average}", ratingFormat.format(branch.rating_average)).replace("{count}", String(branch.rating_count ?? 0))}
          </span>
        ),
      },
      { id: "status", header: t.columns.status, cell: (branch) => <BranchStatusBadge status={branch.status} /> },
      { id: "actions", header: t.columns.actions, interactive: true, align: "end", cell: (branch) => <BranchLifecycleActions branch={branch} actor={actor} /> },
    ];
    if (!showBrand) return base;
    const brand: DataTableColumn<Branch> = { id: "brand", header: t.columns.brand, cell: (branch) => <span dir="auto" className="truncate text-muted-foreground">{branch.brand_id ? brandLabel(branch.brand_id) : t.none}</span> };
    return [...base.slice(0, 1), brand, ...base.slice(1)];
  }, [actor, brandLabel, locale, ratingFormat, showBrand, t]);

  return <DataTable caption={t.title} columns={columns} rows={branches} getRowId={getBranchId} onRowSelect={onSelect} rowLabel={(branch) => localizedText(branch.name, locale)} />;
}
