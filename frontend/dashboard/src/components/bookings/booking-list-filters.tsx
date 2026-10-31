"use client";

import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDictionary } from "@/hooks/use-dictionary";
import type { IBookingListFiltersValue } from "@/components/bookings/booking-list-filters.types";
import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";

interface IBookingListFiltersProps {
  value: IBookingListFiltersValue;
  onChange: (value: IBookingListFiltersValue) => void;
}

const BOOKING_LIST_FILTER_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "no_show",
  "canceled",
];

export function BookingListFilters({
  value,
  onChange,
}: IBookingListFiltersProps) {
  const dictionary = useDictionary();
  const labels = dictionary.operations.bookingFilters;
  const statusLabels: Record<BookingStatus, string> = {
    pending: labels.pending,
    confirmed: labels.confirmed,
    ["in_progress"]: labels.inProgress,
    completed: labels.completed,
    ["no_show"]: labels.noShow,
    canceled: labels.canceled,
  };
  const hasActiveFilters =
    value.status !== "" ||
    value.dateFrom !== "" ||
    value.dateTo !== "" ||
    value.chairId !== "" ||
    value.stylistId !== "";

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        aria-label={dictionary.operations.status}
        value={value.status || "all"}
        onChange={(selected) =>
          onChange({
            ...value,
            status:
              selected === "all" ? "" : (String(selected) as BookingStatus),
          })
        }
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          <SelectItem id="all">{labels.allStatuses}</SelectItem>
          {BOOKING_LIST_FILTER_STATUSES.map((status) => (
            <SelectItem id={status} key={status}>
              {statusLabels[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        aria-label={labels.dateFrom}
        type="date"
        value={value.dateFrom}
        onChange={(event) =>
          onChange({ ...value, dateFrom: event.target.value })
        }
      />
      <Input
        aria-label={labels.dateTo}
        type="date"
        value={value.dateTo}
        onChange={(event) => onChange({ ...value, dateTo: event.target.value })}
      />
      <Input
        aria-label={labels.chairId}
        placeholder={labels.chairId}
        value={value.chairId}
        onChange={(event) =>
          onChange({ ...value, chairId: event.target.value })
        }
      />
      <Input
        aria-label={labels.stylistId}
        placeholder={labels.stylistId}
        value={value.stylistId}
        onChange={(event) =>
          onChange({ ...value, stylistId: event.target.value })
        }
      />
      {hasActiveFilters ? (
        <Button
          appearance="outline"
          onPress={() =>
            onChange({
              status: "",
              dateFrom: "",
              dateTo: "",
              chairId: "",
              stylistId: "",
            })
          }
          type="button"
        >
          {labels.clear}
        </Button>
      ) : null}
    </div>
  );
}
