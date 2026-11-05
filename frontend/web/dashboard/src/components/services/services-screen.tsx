"use client";

import { PlusIcon } from "lucide-react";
import { useCallback, useMemo } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { SearchInput } from "@/components/common/search-input";
import { ServiceGroupSection } from "@/components/services/service-group";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useServiceSearch } from "@/hooks/use-service-search";
import { useServices } from "@/hooks/use-services";
import { useUpdateServiceActive } from "@/hooks/use-update-service-active";
import { groupByCategory } from "@/lib/service-grouping.util";
import { useAuthStore } from "@/store/auth.store";
import type { Service } from "@/types/service.type";

export function ServicesScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.services;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ServicesContent />;
}

function ServicesContent(): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { services: t, bookings } = dictionary;
  const { search, setSearch } = useServiceSearch();
  const overlay = useOverlay();
  const query = useServices(search);
  const toggleActive = useUpdateServiceActive();
  const profile = useAuthStore((state) => state.profile);
  const brandId = profile?.brand_id ?? profile?.brand_ids?.[0] ?? null;

  const items = useMemo(() => query.data ?? [], [query.data]);
  const groups = useMemo(() => groupByCategory(items, locale), [items, locale]);
  const clear = useCallback(() => setSearch(undefined), [setSearch]);
  const openNew = useCallback(() => overlay.open({ kind: OverlayKind.ServiceForm, brandId }), [overlay, brandId]);
  const openEdit = useCallback((service: Service) => overlay.open({ kind: OverlayKind.ServiceForm, service, brandId }), [overlay, brandId]);
  const toggle = useCallback((service: Service, active: boolean) => toggleActive.mutate({ service, active }), [toggleActive]);
  const togglingId = toggleActive.isPending ? (toggleActive.variables?.service.id ?? null) : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} label={t.search} onCommit={setSearch} />
        {brandId ? (
          <Button className="ms-auto" onClick={openNew}>
            <PlusIcon aria-hidden data-icon="inline-start" />
            {t.newService}
          </Button>
        ) : null}
      </div>

      {query.isError && items.length > 0 ? <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{bookings.states.stale}</p> : null}

      <div aria-busy={query.isFetching} className="flex flex-col gap-6">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          search ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.states.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(items.length))}</p>
            {groups.map((group) => (
              <ServiceGroupSection key={group.key} group={group} togglingId={togglingId} onSelect={openEdit} onToggle={toggle} />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
