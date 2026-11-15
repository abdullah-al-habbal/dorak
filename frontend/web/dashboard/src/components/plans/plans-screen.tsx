"use client";

import { PlusIcon } from "lucide-react";
import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PlanList } from "@/components/plans/plan-list";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { AuthActor } from "@/enums/auth-actor.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { PlanState } from "@/enums/plan-state.enum";
import { useI18n } from "@/hooks/core/use-i18n";
import { useOverlay } from "@/hooks/core/use-overlay";
import { usePlanFilters } from "@/hooks/plans/use-plan-filters";
import { usePlans } from "@/hooks/plans/use-plans";
import type { Plan } from "@/types/plans/plan.type";

/** Subscription plans are platform-admin only; the proxy and the backend refuse everyone else too. */
export function PlansScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Admin) {
    const { states } = dictionary.plans;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <PlansContent />;
}

function PlansContent(): JSX.Element {
  const { dictionary } = useI18n();
  const { plans: t } = dictionary;
  const { filters, update } = usePlanFilters();
  const overlay = useOverlay();
  const query = usePlans(filters);
  const clear = () => update({ state: undefined });
  const changePage = (page: number) => update({ page });
  const openNew = () => overlay.open({ kind: OverlayKind.PlanForm });
  const openEdit = (plan: Plan) => overlay.open({ kind: OverlayKind.PlanForm, plan });
  const items = query.data?.items ?? [];
  const page = query.data?.page;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
        <label className="w-full sm:w-44">
          <span className="sr-only">{t.filters.state}</span>
          <NativeSelect value={filters.state ?? ""} onChange={(event) => update({ state: Object.values(PlanState).find((state) => state === event.target.value) })}>
            <option value="">{t.filters.allStates}</option>
            {Object.values(PlanState).map((state) => (
              <option key={state} value={state}>{t.state[state]}</option>
            ))}
          </NativeSelect>
        </label>
        <Button className="ms-auto" onClick={openNew}>
          <PlusIcon aria-hidden data-icon="inline-start" />
          {t.newPlan}
        </Button>
      </div>

      <div aria-busy={query.isFetching} className="flex flex-col gap-4">
        {query.isPending ? <TableSkeleton /> : null}
        {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
        {query.data && items.length === 0 ? (
          filters.state ? (
            <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
          ) : (
            <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
          )
        ) : null}
        {items.length > 0 ? (
          <>
            <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
            <PlanList plans={items} onSelect={openEdit} />
            {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.title} onPageChange={changePage} /> : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
