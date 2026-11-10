"use client";

import { PlusIcon } from "lucide-react";
import { useMemo } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { NativeSelect } from "@/components/ui/native-select";
import { SearchInput } from "@/components/common/search-input";
import { ServiceGroupSection } from "@/components/services/service-group";
import { Button } from "@/components/ui/button";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useBrandOptions } from "@/hooks/use-brand-options";
import { useServiceFilters } from "@/hooks/use-service-filters";
import { useServices } from "@/hooks/use-services";
import { useUpdateServiceActive } from "@/hooks/use-update-service-active";
import { localizedText } from "@/lib/booking-format.util";
import { groupByCategory } from "@/lib/service-grouping.util";
import { useAuthStore } from "@/store/auth.store";
import type { Service } from "@/types/service.type";

export function ServicesScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.services;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ServicesContent readOnly={actor === AuthActor.Admin} />;
}

function ServicesContent({ readOnly }: { readOnly: boolean }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { services: t, bookings } = dictionary;
  const { filters, update } = useServiceFilters();
  const { search, brandId: brandFilter } = filters;
  const brandOptions = useBrandOptions();
  const brandChoices = readOnly ? (brandOptions.data ?? []) : [];
  const overlay = useOverlay();
  const query = useServices(filters);
  const toggleActive = useUpdateServiceActive();
  const profile = useAuthStore((state) => state.profile);
  const brandId = profile?.brand_id ?? profile?.brand_ids?.[0] ?? null;

  const items = useMemo(() => query.data ?? [], [query.data]);
  const groups = useMemo(() => groupByCategory(items, locale), [items, locale]);
  const clear = () => update({ search: undefined, brandId: undefined });
  const openNew = () => overlay.open({ kind: OverlayKind.ServiceForm, brandId });
  const openEdit = (service: Service) => overlay.open({ kind: OverlayKind.ServiceForm, service, brandId });
  const toggle = (service: Service, active: boolean) => toggleActive.mutate({ service, active });
  const togglingId = toggleActive.isPending ? (toggleActive.variables?.service.id ?? null) : null;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} label={t.search} onCommit={(next) => update({ search: next })} />
        {brandChoices.length > 1 ? (
          <label className="w-full sm:w-52">
            <span className="sr-only">{t.brandFilter}</span>
            <NativeSelect value={brandFilter ?? ""} onChange={(event) => update({ brandId: event.target.value || undefined })}>
              <option value="">{t.allBrands}</option>
              {brandChoices.map((brand) => (
                <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
              ))}
            </NativeSelect>
          </label>
        ) : null}
        {brandId && !readOnly ? (
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
          search || brandFilter ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.states.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(items.length))}</p>
            {groups.map((group) => (
              <ServiceGroupSection key={group.key} group={group} togglingId={togglingId} onSelect={openEdit} onToggle={toggle} readOnly={readOnly} />
            ))}
          </>
        ) : null}
      </div>
    </div>
  );
}
