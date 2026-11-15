"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { BranchStatus } from "@/enums/branch-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { BranchFilters } from "@/types/branches/branch-filters.type";
import type { BrandOption } from "@/types/brands/brand-option.type";

interface BranchToolbarProps {
  filters: BranchFilters;
  /** More than one entry shows the brand filter. */
  brands: readonly BrandOption[];
  onChange: (patch: Partial<BranchFilters>) => void;
  onNew: () => void;
}

const STATUSES = new Set<string>(Object.values(BranchStatus));

export function BranchToolbar({ filters, brands, onChange, onNew }: BranchToolbarProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branches: t } = dictionary;

  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: STATUSES.has(event.target.value) ? (event.target.value as BranchStatus) : undefined })}>
          <option value="">{t.filters.allStatuses}</option>
          {Object.values(BranchStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
      {brands.length > 1 ? (
        <label className="w-full sm:w-52">
          <span className="sr-only">{t.filters.brand}</span>
          <NativeSelect value={filters.brandId ?? ""} onChange={(event) => onChange({ brandId: event.target.value || undefined })}>
            <option value="">{t.filters.allBrands}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
            ))}
          </NativeSelect>
        </label>
      ) : null}
      <Button className="ms-auto" onClick={onNew}>
        <PlusIcon aria-hidden data-icon="inline-start" />
        {t.newBranch}
      </Button>
    </div>
  );
}
