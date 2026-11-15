"use client";

import { useState } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import type { ConfirmOverlayRequest } from "@/interfaces/ui/shell/confirm-overlay-request.interface";

interface ConfirmOverlayProps {
  request: ConfirmOverlayRequest;
  onClose: () => void;
}

export function ConfirmOverlay({ request, onClose }: ConfirmOverlayProps) {
  const { common } = useDictionary();
  const [pending, setPending] = useState(false);

  async function confirm() {
    setPending(true);
    try {
      await request.onConfirm();
      onClose();
    } catch {
      // The caller reports the failure; the dialog stays open for a retry.
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || pending ? undefined : onClose())}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{request.title}</DialogTitle>
          <DialogDescription>{request.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" disabled={pending} onClick={onClose}>
            {common.cancel}
          </Button>
          <LoadingButton
            variant={request.destructive ? "destructive" : "default"}
            loading={pending}
            loadingLabel={common.loading}
            onClick={confirm}
          >
            {request.confirmLabel}
          </LoadingButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
