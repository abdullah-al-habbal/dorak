"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { SearchInput } from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { BARBER_CONTACT_PATTERN, BARBER_LOOKUP_MIN, COMMISSION_MAX, COMMISSION_MIN } from "@/config/ops/invitation.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { useBarberLookup } from "@/hooks/stylists/invite/use-barber-lookup";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useInviteBarber } from "@/hooks/stylists/invite/use-invite-barber";
import { useInviteBarberByContact } from "@/hooks/stylists/invite/use-invite-barber-by-contact";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** Finds an existing barber by name, email or phone and invites them to the branch, with an optional commission. */
interface InviteBarberDialogProps {
  branchId: string;
  barber?: { id: string; name: string };
  onClose: () => void;
}

export function InviteBarberDialog({ branchId, barber, onClose }: InviteBarberDialogProps): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { invitations: t, common } = dictionary;
  const invite = useInviteBarber();
  const inviteByContact = useInviteBarberByContact();
  const [term, setTerm] = useState("");
  const [barberId, setBarberId] = useState<string | undefined>(barber?.id);
  const [commission, setCommission] = useState("");
  const [error, setError] = useState<string>();
  const lookup = useBarberLookup(term);
  const results = lookup.data ?? [];

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const contact = term.trim();
    const byContact = !barberId && BARBER_CONTACT_PATTERN.test(contact);
    if (!barberId && !byContact) {
      setError(t.inviteDialog.pick);
      return;
    }
    const percent = commission.trim() === "" ? undefined : Number(commission);
    if (percent !== undefined && !(percent >= COMMISSION_MIN && percent <= COMMISSION_MAX)) {
      setError(t.inviteDialog.commissionRange);
      return;
    }
    const commissionPart = percent === undefined ? {} : { commission_percent: percent };
    try {
      if (barberId) await invite.mutateAsync({ branchId, payload: { barber_id: barberId, ...commissionPart } });
      else await inviteByContact.mutateAsync({ branchId, payload: { contact, ...commissionPart } });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Conflict ? t.inviteDialog.alreadyAffiliated : t.inviteDialog.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || invite.isPending || inviteByContact.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.inviteDialog.title}</DialogTitle>
          <DialogDescription>{t.inviteDialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          {barber ? <p dir="auto" className="rounded-lg border border-primary px-3 py-2 text-sm font-medium">{barber.name}</p> : <FormField id="barber-lookup" label={t.inviteDialog.search} hint={t.inviteDialog.searchHint.replace("{count}", String(BARBER_LOOKUP_MIN))}>
            <SearchInput value={term || undefined} label={t.inviteDialog.search} onCommit={(value) => { setTerm(value ?? ""); setBarberId(undefined); }} />
          </FormField>}
          {term.length >= BARBER_LOOKUP_MIN && lookup.data && results.length === 0 ? <p className="text-sm text-muted-foreground">{BARBER_CONTACT_PATTERN.test(term.trim()) ? t.inviteDialog.contactHint : t.inviteDialog.none}</p> : null}
          {lookup.isError ? <p role="alert" className="text-sm text-destructive">{t.inviteDialog.lookupFailed}</p> : null}
          {results.length > 0 ? (
            <fieldset className="flex flex-col gap-1">
              <legend className="sr-only">{t.inviteDialog.results}</legend>
              {results.map((barber) => (
                <label key={barber.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary">
                  <input type="radio" name="barber" value={barber.id} checked={barberId === barber.id} onChange={() => setBarberId(barber.id)} />
                  <span dir="auto">{localizedText(barber.name, locale)}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
          <FormField id="invite-commission" label={t.inviteDialog.commission} hint={t.inviteDialog.commissionHint}>
            <Input id="invite-commission" type="number" inputMode="decimal" dir="ltr" min={COMMISSION_MIN} max={COMMISSION_MAX} value={commission} onChange={(event) => setCommission(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={invite.isPending || inviteByContact.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={invite.isPending || inviteByContact.isPending} loadingLabel={common.loading}>{t.inviteDialog.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
