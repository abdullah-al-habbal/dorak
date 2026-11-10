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
import { useBanClient } from "@/hooks/use-ban-client";
import { useI18n } from "@/hooks/use-i18n";
import { localizedText } from "@/lib/booking-format.util";
import type { AdminClient } from "@/types/admin-client.type";

interface ClientBanDialogProps {
  client: AdminClient;
  onClose: () => void;
}

/** A ban needs a reason; an empty end date is permanent. The ban signs the client out everywhere. */
export function ClientBanDialog({ client, onClose }: ClientBanDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { clients: t, common } = dictionary;
  const ban = useBanClient();
  const [reason, setReason] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const trimmed = reason.trim();
    if (trimmed.length < CLIENT_BAN_REASON_MIN) {
      setError(t.ban.reasonRequired);
      return;
    }
    const end = expiresAt === "" ? undefined : new Date(expiresAt);
    if (end !== undefined && (Number.isNaN(end.getTime()) || end.getTime() <= Date.now())) {
      setError(t.ban.endInPast);
      return;
    }
    try {
      await ban.mutateAsync({ id: client.id, reason: trimmed, expiresAt: end?.toISOString() });
      onClose();
    } catch {
      setError(t.ban.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || ban.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.ban.title}</DialogTitle>
          <DialogDescription>{t.ban.body.replace("{client}", localizedText(client.name, locale))}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="client-ban-reason" label={t.ban.reason} hint={t.ban.reasonHint}>
            <Textarea id="client-ban-reason" dir="auto" maxLength={CLIENT_BAN_REASON_MAX} value={reason} onChange={(event) => setReason(event.target.value)} />
          </FormField>
          <FormField id="client-ban-end" label={t.ban.endsAt} hint={t.ban.endsAtHint}>
            <Input id="client-ban-end" type="datetime-local" dir="ltr" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={ban.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" variant="destructive" loading={ban.isPending} loadingLabel={common.loading}>{t.ban.confirm}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
