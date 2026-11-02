"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { allowedNextBookingStatuses } from "@/services/api/dashboard/booking/booking-status-transitions.util";
import { bookingStatusSchema } from "@/services/api/dashboard/booking/schemas/booking-status.schema";
import { updateBookingStatus } from "@/services/api/dashboard/booking/booking.mutation";
import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

interface IBookingStatusUpdateFormProps {
  bookingId: string;
  currentStatus: BookingStatus;
  nextStatusLabel: string;
  confirmedLabel: string;
  inProgressLabel: string;
  completedLabel: string;
  noShowLabel: string;
  cancelledLabel: string;
  updateStatusLabel: string;
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

export function BookingStatusUpdateForm({
  bookingId,
  currentStatus,
  nextStatusLabel,
  confirmedLabel,
  inProgressLabel,
  completedLabel,
  noShowLabel,
  cancelledLabel,
  updateStatusLabel,
  onSuccess,
  onError,
}: IBookingStatusUpdateFormProps) {
  const labels: Record<Exclude<BookingStatus, "pending">, string> = {
    confirmed: confirmedLabel,
    ["in_progress"]: inProgressLabel,
    completed: completedLabel,
    ["no_show"]: noShowLabel,
    cancelled: cancelledLabel,
  };
  const nextStatuses = allowedNextBookingStatuses(currentStatus);
  const form = useForm<z.input<typeof bookingStatusSchema>>({
    resolver: zodResolver(bookingStatusSchema),
    defaultValues: { status: nextStatuses[0] },
  });
  const bookingStatus = useWatch({ control: form.control, name: "status" });
  const status = useDashboardMutation(
    "bookings",
    (value: z.input<typeof bookingStatusSchema>) =>
      updateBookingStatus(bookingId, value),
  );

  if (nextStatuses.length === 0) return null;

  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={form.handleSubmit((value) =>
        status.mutate(value, { onSuccess, onError }),
      )}
    >
      <Select
        aria-label={nextStatusLabel}
        value={bookingStatus}
        onChange={(value) => {
          const nextValue = String(value) as z.input<
            typeof bookingStatusSchema
          >["status"];
          form.setValue("status", nextValue);
        }}
      >
        <SelectTrigger>
          <SelectValue />
          <SelectIndicator />
        </SelectTrigger>
        <SelectContent>
          {nextStatuses.map((nextStatus) => (
            <SelectItem id={nextStatus} key={nextStatus}>
              {labels[nextStatus as Exclude<BookingStatus, "pending">]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit" appearance="outline" isDisabled={status.isPending}>
        {updateStatusLabel}
      </Button>
    </form>
  );
}
