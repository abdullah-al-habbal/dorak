"use client";

import { conflictMessage } from "@/components/bookings/booking-actions-dialog.util";
import { BookingRateClientForm } from "@/components/bookings/booking-rate-client-form";
import { BookingRescheduleForm } from "@/components/bookings/booking-reschedule-form";
import { BookingStatusUpdateForm } from "@/components/bookings/booking-status-update-form";
import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { useDashboardMutation } from "@/hooks/use-dashboard-mutation";
import { useDictionary } from "@/hooks/use-dictionary";
import { useSession } from "@/hooks/use-session";
import { cancelBooking } from "@/services/api/dashboard/booking/booking.mutation";
import type { BookingStatus } from "@/services/api/dashboard/booking/types/booking-status.types";
import { toast } from "sonner";
import { useState } from "react";

interface IBookingActionsDialogProps {
  bookingId: string;
  status: BookingStatus;
}

export function BookingActionsDialog({
  bookingId,
  status: currentStatus,
}: IBookingActionsDialogProps) {
  const [open, setOpen] = useState(false);
  const dictionary = useDictionary();
  const session = useSession();
  const canRateClient =
    session.actor === "manager" || session.actor === "owner";
  const copy = dictionary.bookingActions;
  const cancel = useDashboardMutation("bookings", () =>
    cancelBooking(bookingId),
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
          <BookingRescheduleForm
            bookingId={bookingId}
            startLabel={copy.start}
            endLabel={copy.end}
            rescheduleLabel={copy.reschedule}
            onSuccess={closeOnSuccess}
            onError={failed}
          />
          <BookingStatusUpdateForm
            bookingId={bookingId}
            currentStatus={currentStatus}
            nextStatusLabel={copy.nextStatus}
            confirmedLabel={copy.confirmed}
            inProgressLabel={copy.inProgress}
            completedLabel={copy.completed}
            noShowLabel={copy.noShow}
            canceledLabel={copy.canceled}
            updateStatusLabel={copy.updateStatus}
            onSuccess={closeOnSuccess}
            onError={failed}
          />
          {canRateClient ? (
            <BookingRateClientForm
              bookingId={bookingId}
              onRated={() => setOpen(false)}
            />
          ) : null}
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
