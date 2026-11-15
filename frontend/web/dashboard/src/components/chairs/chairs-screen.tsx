"use client";

import { useMemo, useState } from "react";
import type { JSX } from "react";

import { ChairList } from "@/components/chairs/chair-list";
import { ChairToolbar } from "@/components/chairs/chair-toolbar";
import { FloorPlanPanel } from "@/components/floor-plan/floor-plan-panel";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterChips } from "@/components/common/filter-chips";
import { Button } from "@/components/ui/button";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useChairFilters } from "@/hooks/chairs/use-chair-filters";
import { useChairStatusToggle } from "@/hooks/chairs/use-chair-status-toggle";
import { useChairs } from "@/hooks/chairs/use-chairs";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { buildChairChips, CHAIR_CLEAR_ALL_PATCH, chairPatchForChip } from "@/lib/chairs/chair-chips.util";
import { useAuthStore } from "@/store/auth.store";
import type { Chair } from "@/types/chairs/chair.type";

export function ChairsScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor === AuthActor.Barber) {
    const { states } = dictionary.chairs;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ChairsContent readOnly={actor === AuthActor.Admin} />;
}

function ChairsContent({ readOnly }: { readOnly: boolean }): JSX.Element {
  const { dictionary } = useI18n();
  const { chairs: t, bookings } = dictionary;
  const { filters, update } = useChairFilters();
  const overlay = useOverlay();
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const branchOptions = useBranchOptions(ownBranchId === null);
  const branches = useMemo(() => branchOptions.data ?? [], [branchOptions.data]);
  const query = useChairs(filters);
  const { toggle, togglingId } = useChairStatusToggle();
  const [view, setView] = useState<"list" | "plan">("list");
  const planBranchId = ownBranchId ?? filters.branchId ?? branches[0]?.id ?? null;

  const branchLabel = (id: string) => branches.find((branch) => branch.id === id)?.name ?? id;
  const chips = buildChairChips({ filters, dictionary, branchLabel });
  const clear = () => update(CHAIR_CLEAR_ALL_PATCH);
  const removeChip = (key: string) => update(chairPatchForChip(key));
  const changePage = (page: number) => update({ page });
  const openNew = () => overlay.open({ kind: OverlayKind.ChairForm });
  const openEdit = (chair: Chair) => overlay.open({ kind: OverlayKind.ChairForm, chair });

  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <div role="group" aria-label={dictionary.floorPlan.viewLabel} className="flex gap-2">
        <Button type="button" size="sm" variant={view === "list" ? "default" : "outline"} aria-pressed={view === "list"} onClick={() => setView("list")}>{dictionary.floorPlan.listView}</Button>
        <Button type="button" size="sm" variant={view === "plan" ? "default" : "outline"} aria-pressed={view === "plan"} onClick={() => setView("plan")}>{dictionary.floorPlan.planView}</Button>
      </div>
      {view === "plan" ? (
        <>
          {ownBranchId === null && branches.length > 1 ? <ChairToolbar filters={filters} branches={branches} onChange={update} /> : null}
          <FloorPlanPanel branchId={planBranchId} viewOnly={readOnly} />
        </>
      ) : null}
      {view === "list" ? <>
      <ChairToolbar filters={filters} branches={branches} onChange={update} onNew={readOnly ? undefined : openNew} />
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
            <ChairList chairs={items} togglingId={togglingId} onSelect={openEdit} onToggle={toggle} readOnly={readOnly} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
      </> : null}
    </div>
  );
}
