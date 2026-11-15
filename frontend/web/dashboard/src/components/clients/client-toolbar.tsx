"use client";

import type { JSX } from "react";

import { SearchInput } from "@/components/common/search-input";
import { NativeSelect } from "@/components/ui/native-select";
import { CLIENT_STATUS_FILTER_ALL } from "@/config/venue/client.constant";
import { ClientBanFilter } from "@/enums/people/client-ban-filter.enum";
import { ClientStatus } from "@/enums/people/client-status.enum";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import type { ClientFilters } from "@/types/clients/clients/client-filters.type";

interface ClientToolbarProps {
  filters: ClientFilters;
  onChange: (patch: Partial<ClientFilters>) => void;
}

function toStatus(value: string): ClientFilters["status"] {
  return Object.values(ClientStatus).find((status) => status === value) ?? CLIENT_STATUS_FILTER_ALL;
}

function toBan(value: string): ClientBanFilter {
  return Object.values(ClientBanFilter).find((filter) => filter === value) ?? ClientBanFilter.All;
}

export function ClientToolbar({ filters, onChange }: ClientToolbarProps): JSX.Element {
  const { clients: t } = useDictionary();
  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <SearchInput value={filters.search} label={t.filters.search} onCommit={(search) => onChange({ search, page: 1 })} />
      <label className="w-full sm:w-48">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status} onChange={(event) => onChange({ status: toStatus(event.target.value), page: 1 })}>
          <option value={CLIENT_STATUS_FILTER_ALL}>{t.filters.allStatuses}</option>
          {Object.values(ClientStatus).map((status) => (
            <option key={status} value={status}>{t.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
      <label className="w-full sm:w-48">
        <span className="sr-only">{t.filters.ban}</span>
        <NativeSelect value={filters.banned} onChange={(event) => onChange({ banned: toBan(event.target.value), page: 1 })}>
          {Object.values(ClientBanFilter).map((filter) => (
            <option key={filter} value={filter}>{t.filters.banOptions[filter]}</option>
          ))}
        </NativeSelect>
      </label>
    </div>
  );
}
