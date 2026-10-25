"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import { Input } from "@/components/tailgrids/core/input";
import type { cancelBarberBookingFormSchema } from "@/services/api/barber-workspace/schemas/cancel-barber-booking-form.schema";
import type { ComponentProps } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";

interface IBarberCancelBookingDialogProps {
  labels: ComponentProps<typeof Dialog>["labels"];
  isOpen: boolean;
  onClose: () => void;
  form: UseFormReturn<z.infer<typeof cancelBarberBookingFormSchema>>;
  onSubmit: (value: z.infer<typeof cancelBarberBookingFormSchema>) => void;
  isPending: boolean;
  titleLabel: string;
  reasonLabel: string;
  reasonPlaceholder: string;
  cancelLabel: string;
  confirmLabel: string;
}

export function BarberCancelBookingDialog({
  labels,
  isOpen,
  onClose,
  form,
  onSubmit,
  isPending,
  titleLabel,
  reasonLabel,
  reasonPlaceholder,
  cancelLabel,
  confirmLabel,
}: IBarberCancelBookingDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
      labels={labels}
    >
      <DialogHeader>
        <DialogTitle>{titleLabel}</DialogTitle>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogBody>
          <label className="grid gap-2 text-sm text-text-100">
            {reasonLabel}
            <Input
              {...form.register("cancellationReason")}
              placeholder={reasonPlaceholder}
              state={
                form.formState.errors.cancellationReason ? "error" : "default"
              }
            />
          </label>
        </DialogBody>
        <DialogFooter>
          <Button type="button" appearance="outline" onPress={onClose}>
            {cancelLabel}
          </Button>
          <Button type="submit" variant="danger" isDisabled={isPending}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
