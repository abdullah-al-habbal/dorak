"use client";

import { useMemo } from "react";
import type { JSX } from "react";

import { BranchList } from "@/components/branches/branch-list";
import { BranchToolbar } from "@/components/branches/branch-toolbar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterChips } from "@/components/common/filter-chips";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useBranchFilters } from "@/hooks/use-branch-filters";
import { useBranches } from "@/hooks/use-branches";
import { useBrandOptions } from "@/hooks/use-brand-options";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { localizedText } from "@/lib/booking-format.util";
import { BRANCH_CLEAR_ALL_PATCH, branchPatchForChip, buildBranchChips } from "@/lib/branch-chips.util";
import type { Branch } from "@/types/branches/branch.type";

const BRANCH_ACTORS: readonly AuthActor[] = [AuthActor.Admin, AuthActor.Owner];

/** Branch management is for platform admins and brand owners; managers edit their own branch from working hours. */
export function BranchesScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (!BRANCH_ACTORS.includes(actor)) {
    const { states } = dictionary.branches;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <BranchesContent actor={actor} />;
}

function BranchesContent({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branches: t, bookings } = dictionary;
  const { filters, update } = useBranchFilters();
  const overlay = useOverlay();
  const brandOptions = useBrandOptions();
  const brands = useMemo(() => brandOptions.data ?? [], [brandOptions.data]);
  const query = useBranches(filters);

  const brandLabel = (id: string) => {
    const brand = brands.find((candidate) => candidate.id === id);
    return brand ? localizedText(brand.name, locale) : id;
  };
  const chips = buildBranchChips({ filters, dictionary, brandLabel });
  const clear = () => update(BRANCH_CLEAR_ALL_PATCH);
  const removeChip = (key: string) => update(branchPatchForChip(key));
  const changePage = (page: number) => update({ page });
  const openNew = () => overlay.open({ kind: OverlayKind.BranchForm });
  // The platform admin opens a read-only oversight view; owners and managers open the editor.
  const openEdit = (branch: Branch) => overlay.open(actor === AuthActor.Admin ? { kind: OverlayKind.BranchOversight, branch } : { kind: OverlayKind.BranchForm, branch });

  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
      <BranchToolbar filters={filters} brands={brands} onChange={update} onNew={openNew} />
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
            <BranchList branches={items} brandLabel={brandLabel} showBrand={brands.length > 1} onSelect={openEdit} actor={actor} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
