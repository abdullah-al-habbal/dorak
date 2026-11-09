"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { CatalogCategoryStatus } from "@/enums/catalog-category-status.enum";
import { useDictionary } from "@/hooks/use-dictionary";
import type { AdminCatalogFilters } from "@/types/admin-catalog-filters.type";

interface AdminCatalogToolbarProps {
  filters: AdminCatalogFilters;
  onChange: (patch: Partial<AdminCatalogFilters>) => void;
  onCreate: () => void;
}

function toStatus(value: string): CatalogCategoryStatus | undefined {
  return Object.values(CatalogCategoryStatus).find((status) => status === value);
}

export function AdminCatalogToolbar({ filters, onChange, onCreate }: AdminCatalogToolbarProps): JSX.Element {
  const { adminCatalog: t } = useDictionary();
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-44">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: toStatus(event.target.value) })}>
          <option value="">{t.filters.allStatuses}</option>
          {Object.values(CatalogCategoryStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
      <Button className="ms-auto" onClick={onCreate}>
        <PlusIcon aria-hidden data-icon="inline-start" />
        {t.newCategory}
      </Button>
    </div>
  );
}
