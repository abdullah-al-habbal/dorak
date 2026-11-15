"use client";

import type { JSX } from "react";

import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { SCHEDULE_RANGES } from "@/config/schedule.constant";
import { BookingStatus } from "@/enums/booking-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import type { ScheduleFilters } from "@/types/bookings/schedule-filters.type";

const STATUSES = Object.values(BookingStatus);

interface ScheduleToolbarProps {
  filters: ScheduleFilters;
  onChange: (patch: Partial<ScheduleFilters>) => void;
}

export function ScheduleToolbar({ filters, onChange }: ScheduleToolbarProps): JSX.Element {
  const { dictionary } = useI18n();
  const { schedule: t, bookings } = dictionary;

  return (
    <div role="group" aria-label={t.filters.toolbar} className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label={t.filters.range} className="flex gap-1 rounded-lg border border-border bg-card p-1">
        {SCHEDULE_RANGES.map((range) => (
          <Button key={range} size="sm" variant={filters.range === range ? "secondary" : "ghost"} aria-pressed={filters.range === range} onClick={() => onChange({ range })}>
            {t.range[range]}
          </Button>
        ))}
      </div>
      <label className="w-full sm:w-52">
        <span className="sr-only">{t.filters.status}</span>
        <NativeSelect value={filters.status ?? ""} onChange={(event) => onChange({ status: STATUSES.find((status) => status === event.target.value) })}>
          <option value="">{t.filters.allStatuses}</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>{bookings.status[status]}</option>
          ))}
        </NativeSelect>
      </label>
    </div>
  );
}
