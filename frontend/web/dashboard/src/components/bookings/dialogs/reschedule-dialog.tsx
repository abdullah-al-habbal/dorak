"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useRescheduleBooking } from "@/hooks/bookings/use-reschedule-booking";
import { isoToLocalInput, localInputToUtcIso, toLocalInput } from "@/lib/bookings/booking-datetime.util";
import { mapBookingFormError } from "@/lib/bookings/booking-form-error.util";
import { createRescheduleSchema } from "@/schemas/bookings/reschedule-form.zod";
import type { RescheduleFormValues } from "@/schemas/bookings/reschedule-form.zod";
import type { Booking } from "@/types/bookings/booking.type";

const START_FIELD = "starts_at";
const DEFAULT_DURATION_MS = 30 * 60_000;

interface RescheduleDialogProps {
  booking: Booking;
  onClose: () => void;
}

function initialValues(booking: Booking): RescheduleFormValues {
  const start = new Date(booking.starts_at);
  const end = booking.ends_at ? new Date(booking.ends_at) : new Date(start.getTime() + DEFAULT_DURATION_MS);
  return { starts_at: isoToLocalInput(booking.starts_at), ends_at: toLocalInput(end) };
}

export function RescheduleDialog({ booking, onClose }: RescheduleDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { reschedule: r } = dictionary.bookings;
  const { common } = dictionary;
  const mutation = useRescheduleBooking();
  const schema = useMemo(() => createRescheduleSchema(r.validation), [r.validation]);
  const form = useForm<RescheduleFormValues>({ resolver: zodResolver(schema), defaultValues: initialValues(booking) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || mutation.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        id: booking.id,
        payload: { starts_at: localInputToUtcIso(values.starts_at), ends_at: localInputToUtcIso(values.ends_at) },
      });
      onClose();
    } catch (error) {
      const mapped = mapBookingFormError(error, r.errors, START_FIELD);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) {
        form.setError(name as keyof RescheduleFormValues, { message });
      }
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{r.title}</DialogTitle>
          <DialogDescription>{r.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="reschedule-start" label={r.start} error={errors.starts_at?.message}>
            <Input id="reschedule-start" type="datetime-local" dir="ltr" aria-invalid={Boolean(errors.starts_at)} aria-describedby={errors.starts_at ? fieldErrorId("reschedule-start") : undefined} {...form.register("starts_at")} />
          </FormField>
          <FormField id="reschedule-end" label={r.end} error={errors.ends_at?.message}>
            <Input id="reschedule-end" type="datetime-local" dir="ltr" aria-invalid={Boolean(errors.ends_at)} aria-describedby={errors.ends_at ? fieldErrorId("reschedule-end") : undefined} {...form.register("ends_at")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{r.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
