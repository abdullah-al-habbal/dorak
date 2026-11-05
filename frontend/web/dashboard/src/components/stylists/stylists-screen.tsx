"use client";

import { useCallback, useMemo } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterChips } from "@/components/common/filter-chips";
import { StylistList } from "@/components/stylists/stylist-list";
import { StylistToolbar } from "@/components/stylists/stylist-toolbar";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useChairOptions } from "@/hooks/use-chair-options";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useStylistFilters } from "@/hooks/use-stylist-filters";
import { useStylists } from "@/hooks/use-stylists";
import { useUpdateStylistStatus } from "@/hooks/use-update-stylist-status";
import { localizedText } from "@/lib/booking-format.util";
import { buildStylistChips, STYLIST_CLEAR_ALL_PATCH, stylistPatchForChip } from "@/lib/stylist-chips.util";
import type { Stylist } from "@/types/stylist.type";

export function StylistsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.stylists;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <StylistsContent />;
}

function StylistsContent(): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { stylists: t, bookings } = dictionary;
  const { filters, update } = useStylistFilters();
  const overlay = useOverlay();
  const chairs = useChairOptions();
  const query = useStylists(filters);
  const status = useUpdateStylistStatus();

  const chairLabel = useCallback(
    (id: string) => localizedText(chairs.data?.find((chair) => chair.id === id)?.label, locale) || id,
    [chairs.data, locale],
  );
  const chips = useMemo(() => buildStylistChips({ filters, dictionary, chairLabel }), [filters, dictionary, chairLabel]);
  const clear = useCallback(() => update(STYLIST_CLEAR_ALL_PATCH), [update]);
  const removeChip = useCallback((key: string) => update(stylistPatchForChip(key)), [update]);
  const changePage = useCallback((page: number) => update({ page }), [update]);
  const openNew = useCallback(() => overlay.open({ kind: OverlayKind.StylistForm }), [overlay]);
  const openEdit = useCallback((stylist: Stylist) => overlay.open({ kind: OverlayKind.StylistForm, stylist }), [overlay]);

  const toggle = useCallback(
    (stylist: Stylist, active: boolean) => {
      if (active) {
        status.mutate({ id: stylist.id, active });
        return;
      }
      overlay.open({
        kind: OverlayKind.Confirm,
        title: t.confirm.deactivateTitle,
        description: t.confirm.deactivateBody,
        confirmLabel: t.confirm.deactivate,
        destructive: true,
        onConfirm: async () => {
          await status.mutateAsync({ id: stylist.id, active });
        },
      });
    },
    [overlay, status, t],
  );

  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <StylistToolbar filters={filters} chairs={chairs.data ?? []} onChange={update} onNew={openNew} />
      <FilterChips chips={chips} onRemove={removeChip} onClearAll={clear} />

      {query.isError && items.length > 0 ? <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{bookings.states.stale}</p> : null}

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          chips.length > 0 ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <StylistList stylists={items} togglingId={status.isPending ? (status.variables?.id ?? null) : null} onSelect={openEdit} onToggle={toggle} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
