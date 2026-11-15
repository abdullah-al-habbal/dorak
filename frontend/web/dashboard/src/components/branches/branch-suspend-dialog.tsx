"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BRAND_REASON_MAX, BRAND_REASON_MIN } from "@/config/admin-brand.constant";
import { BranchLifecycleAction } from "@/enums/branch-lifecycle-action.enum";
import { useBranchLifecycle } from "@/hooks/branches/use-branch-lifecycle";
import { useI18n } from "@/hooks/core/use-i18n";
import { localizedText } from "@/lib/core/booking-format.util";
import type { Branch } from "@/types/branches/branch.type";

interface BranchSuspendDialogProps {
  branch: Branch;
  onClose: () => void;
}

/** The admin suspends a branch with a reason; the branch leaves search and takes no new bookings. */
export function BranchSuspendDialog({ branch, onClose }: BranchSuspendDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { branches: t, common } = dictionary;
  const lifecycle = useBranchLifecycle();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const trimmed = reason.trim();
    if (trimmed.length < BRAND_REASON_MIN) {
      setError(t.lifecycle.reasonRequired);
      return;
    }
    try {
      await lifecycle.mutateAsync({ id: branch.id, action: BranchLifecycleAction.Suspend, reason: trimmed });
      onClose();
    } catch {
      setError(t.lifecycle.toast.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || lifecycle.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.lifecycle.suspendDialog.title}</DialogTitle>
          <DialogDescription>{t.lifecycle.suspendDialog.body.replace("{branch}", localizedText(branch.name, locale))}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="branch-suspend-reason" label={t.lifecycle.reason} hint={t.lifecycle.reasonHint}>
            <Textarea id="branch-suspend-reason" dir="auto" maxLength={BRAND_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={lifecycle.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" variant="destructive" loading={lifecycle.isPending} loadingLabel={common.loading}>{t.lifecycle.suspendDialog.confirm}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
