"use client";

import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { AdminUserState } from "@/enums/admin-user-state.enum";
import { useDictionary } from "@/hooks/core/use-dictionary";
import type { AdminUserFilters } from "@/types/platform/admin-user-filters.type";

interface AdminUserToolbarProps {
  filters: AdminUserFilters;
  onChange: (patch: Partial<AdminUserFilters>) => void;
}

function toState(value: string): AdminUserState {
  return Object.values(AdminUserState).find((state) => state === value) ?? AdminUserState.All;
}

export function AdminUserToolbar({ filters, onChange }: AdminUserToolbarProps): JSX.Element {
  const { adminUsers: t } = useDictionary();
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search })} />
      <label className="w-full sm:w-48">
        <span className="sr-only">{t.filters.state}</span>
        <NativeSelect value={filters.state} onChange={(event) => onChange({ state: toState(event.target.value) })}>
          <option value={AdminUserState.All}>{t.filters.allStates}</option>
          <option value={AdminUserState.Active}>{t.state.active}</option>
          <option value={AdminUserState.Inactive}>{t.state.inactive}</option>
        </NativeSelect>
      </label>
    </div>
  );
}
