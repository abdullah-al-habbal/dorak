"use client";

import { Button } from "@/components/tailgrids/core/button";
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/tailgrids/core/dialog";
import type { ComponentProps } from "react";

interface IBarberDeletePhotoDialogProps {
  labels: ComponentProps<typeof Dialog>["labels"];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  titleLabel: string;
  cancelLabel: string;
  confirmLabel: string;
}

export function BarberDeletePhotoDialog({
  labels,
  isOpen,
  onClose,
  onConfirm,
  isPending,
  titleLabel,
  cancelLabel,
  confirmLabel,
}: IBarberDeletePhotoDialogProps) {
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
      <DialogBody />
      <DialogFooter>
        <Button type="button" appearance="outline" onPress={onClose}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant="danger"
          isDisabled={isPending}
          onPress={onConfirm}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
