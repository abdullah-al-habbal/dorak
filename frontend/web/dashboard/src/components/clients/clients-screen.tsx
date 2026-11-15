"use client";

import type { JSX } from "react";

import { ClientList } from "@/components/clients/client-list";
import { ClientToolbar } from "@/components/clients/client-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { CLIENT_STATUS_FILTER_ALL } from "@/config/client.constant";
import { AuthActor } from "@/enums/auth-actor.enum";
import { ClientBanFilter } from "@/enums/client-ban-filter.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useClientFilters } from "@/hooks/clients/use-client-filters";
import { useClients } from "@/hooks/clients/use-clients";
import { useConfirmUnbanClient } from "@/hooks/clients/use-confirm-unban-client";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { hasClientFilters } from "@/lib/clients/client-filters.util";
import type { AdminClient } from "@/types/clients/admin-client.type";

/** Clients are managed by platform admins only; the proxy and the backend refuse everyone else too. */
export function ClientsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.clients;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ClientsContent />;
}

function ClientsContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { clients: t } = dictionary;
  const { filters, update } = useClientFilters();
  const overlay = useOverlay();
  const confirmUnban = useConfirmUnbanClient();
  const query = useClients(filters);
  const clear = () => update({ status: CLIENT_STATUS_FILTER_ALL, banned: ClientBanFilter.All, search: undefined, page: 1 });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <ClientToolbar filters={filters} onChange={update} />

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          hasClientFilters(filters) ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <ClientList
              clients={items}
              onSelect={(client: AdminClient) => overlay.open({ kind: OverlayKind.ClientDetail, client })}
              onBan={(client: AdminClient) => overlay.open({ kind: OverlayKind.ClientBan, client })}
              onUnban={confirmUnban}
            />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={(next) => update({ page: next })} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
