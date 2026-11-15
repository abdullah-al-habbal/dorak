"use client";

import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { BRAND_STATUS_FILTER_ALL } from "@/config/admin-brand.constant";
import { BrandStatus } from "@/enums/brand-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { AdminBrandFilters } from "@/types/brands/admin-brand-filters.type";

interface AdminBrandToolbarProps {
  filters: AdminBrandFilters;
  onChange: (patch: Partial<AdminBrandFilters>) => void;
}

function toStatusFilter(value: string): AdminBrandFilters["status"] {
  return Object.values(BrandStatus).find((status) => status === value) ?? BRAND_STATUS_FILTER_ALL;
}

export function AdminBrandToolbar({ filters, onChange }: AdminBrandToolbarProps): JSX.Element {
  const { adminBrands: t } = useDictionary();
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-52">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status} onChange={(event) => onChange({ status: toStatusFilter(event.target.value) })}>
          {Object.values(BrandStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
          <option value={BRAND_STATUS_FILTER_ALL}>{t.filters.allStatuses}</option>
        </NativeSelect>
      </label>
    </div>
  );
}
