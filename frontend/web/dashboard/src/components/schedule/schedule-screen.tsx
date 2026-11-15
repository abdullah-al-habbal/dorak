"use client";

import type { JSX } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ScheduleAppointmentList } from "@/components/schedule/schedule-appointment-list";
import { ScheduleHoursCard } from "@/components/schedule/schedule-hours-card";
import { ScheduleToolbar } from "@/components/schedule/schedule-toolbar";
import { PaginationBar } from "@/components/ui/table/pagination-bar";
import { TableSkeleton } from "@/components/ui/table/table-skeleton";
import { SCHEDULE_DEFAULT_RANGE } from "@/config/ops/schedule.constant";
import { WEEK_START } from "@/config/week-start.constant";
import { AuthActor } from "@/enums/access/auth-actor.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useScheduleAppointments } from "@/hooks/bookings/use-schedule-appointments";
import { useScheduleFilters } from "@/hooks/bookings/use-schedule-filters";

export function ScheduleScreen({ actor }: { actor: AuthActor }): JSX.Element {
  const { dictionary } = useI18n();
  if (actor !== AuthActor.Barber) {
    const { states } = dictionary.schedule;
    return <EmptyState variant="forbidden" title={states.forbiddenTitle} body={states.forbiddenBody} />;
  }
  return <ScheduleContent />;
}

function ScheduleContent(): JSX.Element {
  const { locale, dictionary } = useI18n();
  const { schedule: t } = dictionary;
  const { filters, update } = useScheduleFilters();
  const query = useScheduleAppointments(filters, WEEK_START[locale]);
  const clear = () => update({ status: undefined, range: SCHEDULE_DEFAULT_RANGE });
  const changePage = (page: number) => update({ page });
  const items = query.data?.items ?? [];
  const page = query.data?.page;
  const filtered = filters.status !== undefined || filters.range !== SCHEDULE_DEFAULT_RANGE;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-semibold">{t.title}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">{t.description}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-labelledby="schedule-appointments-title" className="flex min-w-0 flex-col gap-4 lg:order-1">
          <h2 id="schedule-appointments-title" className="font-heading text-lg font-semibold">{t.appointments.title}</h2>
          <ScheduleToolbar filters={filters} onChange={update} />

          <div aria-busy={query.isFetching} className="flex flex-col gap-4">
            {query.isPending ? <TableSkeleton /> : null}
            {query.isError && items.length === 0 ? <ErrorState title={t.states.errorTitle} body={t.states.errorBody} onRetry={() => query.refetch()} /> : null}
            {query.data && items.length === 0 ? (
              filtered ? (
                <EmptyState variant="filtered" title={t.states.filteredTitle} body={t.states.filteredBody} onClear={clear} clearLabel={t.filters.clear} />
              ) : (
                <EmptyState title={t.states.emptyTitle} body={t.states.emptyBody} />
              )
            ) : null}
            {items.length > 0 ? (
              <>
                <p className="tabular text-sm text-muted-foreground" aria-live="polite">{t.states.results.replace("{count}", String(page?.total ?? items.length))}</p>
                <ScheduleAppointmentList bookings={items} />
                {page ? <PaginationBar page={page.current_page} totalPages={page.total_pages} label={t.appointments.title} onPageChange={changePage} /> : null}
              </>
            ) : null}
          </div>
        </section>

        <div className="lg:order-2">
          <ScheduleHoursCard />
        </div>
      </div>
    </div>
  );
}
