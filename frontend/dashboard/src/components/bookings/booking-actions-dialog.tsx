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
import { bookingRescheduleSchema } from "@/services/api/dashboard/booking-reschedule.schema";
import { bookingStatusSchema } from "@/services/api/dashboard/booking-status.schema";
import { mapBookingReschedulePayload } from "@/services/api/dashboard/dashboard-payload-mapper.util";
import {
  cancelBooking,
  rescheduleBooking,
  updateBookingStatus,
} from "@/services/api/dashboard/dashboard-workflow.mutation";
import { ApiClientError } from "@/services/api/client-error";
import { toast } from "sonner";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

interface IBookingActionsDialogProps {
  bookingId: string;
}

function conflictMessage(error: unknown): string {
  return error instanceof ApiClientError && error.status === 409
    ? "Booking conflicts with the requested schedule."
    : error instanceof Error
      ? error.message
      : "Booking action failed.";
}
function iso(value: string): string {
  return new Date(value).toISOString();
}

export function BookingActionsDialog({
  bookingId,
}: IBookingActionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [bookingStatus, setBookingStatus] = useState("confirmed");
  const rescheduleForm = useForm<z.input<typeof bookingRescheduleSchema>>({
    resolver: zodResolver(bookingRescheduleSchema),
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
    (value: z.input<typeof bookingRescheduleSchema>) =>
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
  const failed = (error: unknown) => toast.error(conflictMessage(error));
  const closeOnSuccess = () => {
    toast.success("Booking updated.");
    setOpen(false);
  };

  return (
    <>
      <Button appearance="outline" size="sm" onPress={() => setOpen(true)}>
        Manage
      </Button>
      <Dialog isOpen={open} onOpenChange={setOpen} labels={{ close: "Close" }}>
        <DialogHeader>
          <DialogTitle>Manage booking</DialogTitle>
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
              Start
              <Input
                type="datetime-local"
                {...rescheduleForm.register("timeSlot")}
                state={
                  rescheduleForm.formState.errors.timeSlot ? "error" : "default"
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              End
              <Input
                type="datetime-local"
                {...rescheduleForm.register("endsAt")}
                state={
                  rescheduleForm.formState.errors.endsAt ? "error" : "default"
                }
              />
            </label>
            <Button type="submit" isDisabled={reschedule.isPending}>
              Reschedule
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
              aria-label="Next booking status"
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
                <SelectItem id="confirmed">Confirmed</SelectItem>
                <SelectItem id="in_progress">In progress</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="submit"
              appearance="outline"
              isDisabled={status.isPending}
            >
              Update status
            </Button>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button appearance="outline" onPress={() => setOpen(false)}>
            Close
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
            Cancel booking
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
