"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CLIENT_BAN_REASON_MAX, CLIENT_BAN_REASON_MIN } from "@/config/client.constant";
import { useDictionary } from "@/hooks/use-dictionary";
import type { BanDialogCopy } from "@/interfaces/ban-dialog-copy.interface";
import type { BanSubmission } from "@/interfaces/ban-submission.interface";

interface AccountBanDialogProps {
  copy: BanDialogCopy;
  /** Already filled with the account's name. */
  body: string;
  pending: boolean;
  onSubmit: (submission: BanSubmission) => Promise<unknown>;
  onClose: () => void;
}

/** A ban needs a reason; an empty end date is permanent. The ban signs the account out everywhere. */
export function AccountBanDialog({ copy, body, pending, onSubmit, onClose }: AccountBanDialogProps): JSX.Element {
  const { common } = useDictionary();
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const trimmed = reason.trim();
    if (trimmed.length < CLIENT_BAN_REASON_MIN) {
      setError(copy.reasonRequired);
      return;
    }
    const end = expiresAt === "" ? undefined : new Date(expiresAt);
    if (end !== undefined && (Number.isNaN(end.getTime()) || end.getTime() <= Date.now())) {
      setError(copy.endInPast);
      return;
    }
    try {
      await onSubmit({ reason: trimmed, expiresAt: end?.toISOString() });
      onClose();
    } catch {
      setError(copy.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || pending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{copy.title}</DialogTitle>
          <DialogDescription>{body}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="account-ban-reason" label={copy.reason} hint={copy.reasonHint}>
            <Textarea id="account-ban-reason" dir="auto" maxLength={CLIENT_BAN_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <FormField id="account-ban-end" label={copy.endsAt} hint={copy.endsAtHint}>
            <Input id="account-ban-end" type="datetime-local" dir="ltr" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={pending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" variant="destructive" loading={pending} loadingLabel={common.loading}>{copy.confirm}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
