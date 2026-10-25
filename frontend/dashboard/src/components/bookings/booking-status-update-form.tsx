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
import { bookingStatusSchema } from "@/services/api/dashboard/booking-status.schema";
import { updateBookingStatus } from "@/services/api/dashboard/dashboard-workflow.mutation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface IBookingStatusUpdateFormProps {
  bookingId: string;
  nextStatusLabel: string;
  confirmedLabel: string;
  inProgressLabel: string;
  completedLabel: string;
  noShowLabel: string;
  canceledLabel: string;
  updateStatusLabel: string;
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

export function BookingStatusUpdateForm({
  bookingId,
  nextStatusLabel,
  confirmedLabel,
  inProgressLabel,
  completedLabel,
  noShowLabel,
  canceledLabel,
  updateStatusLabel,
  onSuccess,
  onError,
}: IBookingStatusUpdateFormProps) {
  const form = useForm<z.input<typeof bookingStatusSchema>>({
    resolver: zodResolver(bookingStatusSchema),
    defaultValues: { status: "confirmed" },
  });
  const bookingStatus = form.watch("status");
  const status = useDashboardMutation(
    "bookings",
    (value: z.input<typeof bookingStatusSchema>) =>
      updateBookingStatus(bookingId, value),
  );

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
          <SelectItem id="confirmed">{confirmedLabel}</SelectItem>
          <SelectItem id="in_progress">{inProgressLabel}</SelectItem>
          <SelectItem id="completed">{completedLabel}</SelectItem>
          <SelectItem id="no_show">{noShowLabel}</SelectItem>
          <SelectItem id="canceled">{canceledLabel}</SelectItem>
        </SelectContent>
      </Select>
      <Button type="submit" appearance="outline" isDisabled={status.isPending}>
        {updateStatusLabel}
      </Button>
    </form>
  );
}
