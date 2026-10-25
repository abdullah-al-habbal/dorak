"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { toIsoDateTime } from "@/components/bookings/booking-actions-dialog.util";
import { Button } from "@/components/tailgrids/core/button";
import { Input } from "@/components/tailgrids/core/input";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { createBookingRescheduleSchema } from "@/services/api/dashboard/booking-reschedule.schema";
import type { BookingRescheduleInput } from "@/services/api/dashboard/booking-reschedule.types";
import { mapBookingReschedulePayload } from "@/services/api/dashboard/dashboard-payload-mapper.util";
import { rescheduleBooking } from "@/services/api/dashboard/dashboard-workflow.mutation";
import { useForm } from "react-hook-form";

interface IBookingRescheduleFormProps {
  bookingId: string;
  startLabel: string;
  endLabel: string;
  rescheduleLabel: string;
  onSuccess: () => void;
  onError: (error: unknown) => void;
}

export function BookingRescheduleForm({
  bookingId,
  startLabel,
  endLabel,
  rescheduleLabel,
  onSuccess,
  onError,
}: IBookingRescheduleFormProps) {
  const dictionary = useDictionary();
  const schema = createBookingRescheduleSchema(dictionary.validation);
  const form = useForm<BookingRescheduleInput>({
    resolver: zodResolver(schema),
    defaultValues: { timeSlot: "", endsAt: "" },
  });
  const reschedule = useDashboardMutation(
    "bookings",
    (value: BookingRescheduleInput) =>
      rescheduleBooking(
        bookingId,
        mapBookingReschedulePayload({
          timeSlot: toIsoDateTime(value.timeSlot),
          endsAt: toIsoDateTime(value.endsAt),
        }),
      ),
  );

  return (
    <form
      className="grid gap-3"
      onSubmit={form.handleSubmit((value) =>
        reschedule.mutate(value, { onSuccess, onError }),
      )}
    >
      <label className="grid gap-1 text-sm">
        {startLabel}
        <Input
          type="datetime-local"
          {...form.register("timeSlot")}
          state={form.formState.errors.timeSlot ? "error" : "default"}
        />
      </label>
      <label className="grid gap-1 text-sm">
        {endLabel}
        <Input
          type="datetime-local"
          {...form.register("endsAt")}
          state={form.formState.errors.endsAt ? "error" : "default"}
        />
      </label>
      {form.formState.isSubmitted &&
      Object.keys(form.formState.errors).length > 0 ? (
        <p className="text-input-error-focus-border" role="alert">
          {dictionary.validation.invalidField}
        </p>
      ) : null}
      <Button type="submit" isDisabled={reschedule.isPending}>
        {rescheduleLabel}
      </Button>
    </form>
  );
}
