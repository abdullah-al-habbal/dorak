"use client";

import { useState } from "react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterChips } from "@/components/common/filter-chips";
import { InvitationsPanel } from "@/components/invitations/invitations-panel";
import { StylistList } from "@/components/stylists/stylist-list";
import { StylistToolbar } from "@/components/stylists/stylist-toolbar";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useChairOptions } from "@/hooks/chairs/use-chair-options";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useStylistFilters } from "@/hooks/stylists/use-stylist-filters";
import { useAuthStore } from "@/store/auth.store";
import { useStylists } from "@/hooks/stylists/use-stylists";
import { useUpdateStylistStatus } from "@/hooks/stylists/use-update-stylist-status";
import { localizedText } from "@/lib/booking-format.util";
import { buildStylistChips, STYLIST_CLEAR_ALL_PATCH, stylistPatchForChip } from "@/lib/stylist-chips.util";
import type { Stylist } from "@/types/stylists/stylist.type";

export function StylistsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.stylists;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <StylistsContent readOnly={actor === AuthActor.Admin} />;
}

function StylistsContent({ readOnly }: { readOnly: boolean }): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { stylists: t, bookings } = dictionary;
  const { filters, update } = useStylistFilters();
  const overlay = useOverlay();
  const chairs = useChairOptions();
  const branchOptions = useBranchOptions(readOnly);
  const branches = branchOptions.data ?? [];
  const query = useStylists(filters);
  const status = useUpdateStylistStatus();
  const [view, setView] = useState<"list" | "invitations">("list");
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const invitationBranchId = ownBranchId ?? filters.branchId ?? branches[0]?.id ?? null;

  const chairLabel = (id: string) => localizedText(chairs.data?.find((chair) => chair.id === id)?.label, locale) || id;
  const branchLabel = (id: string) => branches.find((branch) => branch.id === id)?.name ?? id;
  const chips = buildStylistChips({ filters, dictionary, chairLabel, branchLabel });
  const clear = () => update(STYLIST_CLEAR_ALL_PATCH);
  const removeChip = (key: string) => update(stylistPatchForChip(key));
  const changePage = (page: number) => update({ page });
  const openNew = () => overlay.open({ kind: OverlayKind.StylistForm });
  const openEdit = (stylist: Stylist) => overlay.open({ kind: OverlayKind.StylistForm, stylist });

  const toggle = (stylist: Stylist, active: boolean) => {
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
  };

  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div role="group" aria-label={dictionary.invitations.tabsLabel} className="flex gap-2">
        <Button type="button" size="sm" variant={view === "list" ? "default" : "outline"} aria-pressed={view === "list"} onClick={() => setView("list")}>{dictionary.invitations.listTab}</Button>
        <Button type="button" size="sm" variant={view === "invitations" ? "default" : "outline"} aria-pressed={view === "invitations"} onClick={() => setView("invitations")}>{dictionary.invitations.tab}</Button>
      </div>
      {view === "invitations" ? (
        <>
          {ownBranchId === null && branches.length > 1 ? <StylistToolbar filters={filters} chairs={chairs.data ?? []} branches={branches} onChange={update} /> : null}
          <InvitationsPanel branchId={invitationBranchId} readOnly={readOnly} />
        </>
      ) : null}
      {view === "list" ? <>
      <StylistToolbar filters={filters} chairs={chairs.data ?? []} branches={branches} onChange={update} onNew={readOnly ? undefined : openNew} />
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
            <StylistList stylists={items} togglingId={status.isPending ? (status.variables?.id ?? null) : null} onSelect={openEdit} onToggle={toggle} readOnly={readOnly} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
      </> : null}
    </div>
  );
}
