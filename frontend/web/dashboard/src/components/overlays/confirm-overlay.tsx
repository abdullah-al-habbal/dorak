"use client";

import { useState } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ACTIVATION_REASON_MAX, ACTIVATION_REASON_MIN } from "@/config/ops/activation-reason.constant";
import { useDictionary } from "@/hooks/core/state/use-dictionary";
import type { ConfirmOverlayRequest } from "@/interfaces/ui/shell/confirm-overlay-request.interface";

interface ConfirmOverlayProps {
  request: ConfirmOverlayRequest;
  onClose: () => void;
}

export function ConfirmOverlay({ request, onClose }: ConfirmOverlayProps) {
  const { common } = useDictionary();
  const [pending, setPending] = useState(false);
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < ACTIVATION_REASON_MIN;

  async function confirm() {
    if (tooShort) return;
    setPending(true);
    try {
      await request.onConfirm(trimmed === "" ? undefined : trimmed);
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
        {request.reason ? (
          <FormField id="confirm-reason" label={request.reason.label} error={tooShort ? common.reason.tooShort.replace("{min}", String(ACTIVATION_REASON_MIN)) : undefined}>
            <Textarea id="confirm-reason" dir="auto" aria-describedby={tooShort ? fieldErrorId("confirm-reason") : undefined} maxLength={ACTIVATION_REASON_MAX} value={reason} disabled={pending} onChange={(event) => setReason(event.target.value)} />
          </FormField>
        ) : null}
        <DialogFooter>
          <Button variant="ghost" disabled={pending} onClick={onClose}>
            {common.cancel}
          </Button>
          <LoadingButton
            variant={request.destructive ? "destructive" : "default"}
            loading={pending}
            disabled={tooShort}
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
