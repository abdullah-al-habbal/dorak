"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import {
  Select,
  SelectContent,
  SelectIndicator,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/tailgrids/core/select";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { createBookingRescheduleSchema } from "@/services/api/dashboard/booking-reschedule.schema";
import type { BookingRescheduleInput } from "@/services/api/dashboard/booking-reschedule.types";
import { bookingStatusSchema } from "@/services/api/dashboard/booking-status.schema";
import { mapBookingReschedulePayload } from "@/services/api/dashboard/dashboard-payload-mapper.util";
import {
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
} from "@/services/api/dashboard/dashboard-workflow.mutation";
import { ApiClientError } from "@/services/api/client-error";
import { apiErrorMessage } from "@/services/api/api-error-message.util";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface IBookingActionsDialogProps {
  bookingId: string;
}

function conflictMessage(
  error: unknown,
  copy: { conflict: string },
  dictionary: ReturnType<typeof useDictionary>,
): string {
  return error instanceof ApiClientError && error.status === 409
    ? copy.conflict
    : apiErrorMessage(error, dictionary);
}
function iso(value: string): string {
  return new Date(value).toISOString();
}

export function BookingActionsDialog({
  bookingId,
}: IBookingActionsDialogProps) {
  const [open, setOpen] = useState(false);
  const dictionary = useDictionary();
  const copy = dictionary.bookingActions;
  const rescheduleSchema = createBookingRescheduleSchema(dictionary.validation);
  const [bookingStatus, setBookingStatus] = useState("confirmed");
  const rescheduleForm = useForm<BookingRescheduleInput>({
    resolver: zodResolver(rescheduleSchema),
    defaultValues: { timeSlot: "", endsAt: "" },
  });
  const statusForm = useForm<z.input<typeof bookingStatusSchema>>({
    resolver: zodResolver(bookingStatusSchema),
    defaultValues: { status: "confirmed" },
  });
  const cancel = useDashboardMutation("bookings", () =>
    cancelBooking(bookingId),
  );
  const reschedule = useDashboardMutation(
    "bookings",
    (value: BookingRescheduleInput) =>
      rescheduleBooking(
        bookingId,
        mapBookingReschedulePayload({
          timeSlot: iso(value.timeSlot),
          endsAt: iso(value.endsAt),
        }),
      ),
  );
  const status = useDashboardMutation(
    "bookings",
    (value: z.input<typeof bookingStatusSchema>) =>
      updateBookingStatus(bookingId, value),
  );
  const failed = (error: unknown) =>
    toast.error(conflictMessage(error, copy, dictionary));
  const closeOnSuccess = () => {
    toast.success(copy.bookingUpdated);
    setOpen(false);
  };

  return (
    <>
      <Button appearance="outline" size="sm" onPress={() => setOpen(true)}>
        {copy.manage}
      </Button>
      <Dialog
        isOpen={open}
        onOpenChange={setOpen}
        labels={{ close: copy.close }}
      >
        <DialogHeader>
          <DialogTitle>{copy.manageTitle}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            className="grid gap-3"
            onSubmit={rescheduleForm.handleSubmit((value) =>
              reschedule.mutate(value, {
                onSuccess: closeOnSuccess,
                onError: failed,
              }),
            )}
          >
            <label className="grid gap-1 text-sm">
              {copy.start}
              <Input
                type="datetime-local"
                {...rescheduleForm.register("timeSlot")}
                state={
                  rescheduleForm.formState.errors.timeSlot ? "error" : "default"
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              {copy.end}
              <Input
                type="datetime-local"
                {...rescheduleForm.register("endsAt")}
                state={
                  rescheduleForm.formState.errors.endsAt ? "error" : "default"
                }
              />
            </label>
            {rescheduleForm.formState.isSubmitted &&
            Object.keys(rescheduleForm.formState.errors).length > 0 ? (
              <p className="text-input-error-focus-border" role="alert">
                {dictionary.validation.invalidField}
              </p>
            ) : null}
            <Button type="submit" isDisabled={reschedule.isPending}>
              {copy.reschedule}
            </Button>
          </form>
          <form
            className="mt-4 flex gap-2"
            onSubmit={statusForm.handleSubmit((value) =>
              status.mutate(value, {
                onSuccess: closeOnSuccess,
                onError: failed,
              }),
            )}
          >
            <Select
              aria-label={copy.nextStatus}
              value={bookingStatus}
              onChange={(value) => {
                const nextValue = String(value) as z.input<
                  typeof bookingStatusSchema
                >["status"];
                setBookingStatus(nextValue);
                statusForm.setValue("status", nextValue);
              }}
            >
              <SelectTrigger>
                <SelectValue />
                <SelectIndicator />
              </SelectTrigger>
              <SelectContent>
                <SelectItem id="confirmed">{copy.confirmed}</SelectItem>
                <SelectItem id="in_progress">{copy.inProgress}</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              appearance="outline"
              isDisabled={status.isPending}
            >
              {copy.updateStatus}
            </Button>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button appearance="outline" onPress={() => setOpen(false)}>
            {copy.close}
          </Button>
          <Button
            appearance="outline"
            onPress={() =>
              cancel.mutate(undefined, {
                onSuccess: closeOnSuccess,
                onError: failed,
              })
            }
            isDisabled={cancel.isPending}
          >
            {copy.cancelBooking}
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
