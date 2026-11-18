"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
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
import { formToInviteRequest, mapInviteFieldName } from "@/lib/branches/invite-barber-form.util";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { createInviteBarberFormSchema } from "@/schemas/branches/invite-barber-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { InviteBarberFormValues } from "@/types/branches/invite-barber-form-values.type";

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
  const schema = useMemo(() => createInviteBarberFormSchema(t.inviteDialog), [t.inviteDialog]);
  const form = useForm<InviteBarberFormValues>({ resolver: zodResolver(schema), defaultValues: { term: "", barber_id: barber?.id ?? "", commission: "" } });
  const { errors } = form.formState;
  const term = useWatch({ control: form.control, name: "term" });
  const barberId = useWatch({ control: form.control, name: "barber_id" });
  const lookup = useBarberLookup(term);
  const results = lookup.data ?? [];
  const busy = form.formState.isSubmitting || invite.isPending || inviteByContact.isPending;

  const submit = form.handleSubmit(async (values) => {
    const request = formToInviteRequest(values);
    try {
      if (request.kind === "barber") await invite.mutateAsync({ branchId, payload: request.payload });
      else await inviteByContact.mutateAsync({ branchId, payload: request.payload });
      onClose();
    } catch (failure) {
      const conflict = failure instanceof ApiClientError && failure.status === HttpStatus.Conflict;
      applyFormError(form, mapApiFormError(failure, conflict ? t.inviteDialog.alreadyAffiliated : t.inviteDialog.failed, mapInviteFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t.inviteDialog.title}</DialogTitle>
          <DialogDescription>{t.inviteDialog.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          {barber ? <p dir="auto" className="rounded-lg border border-primary px-3 py-2 text-sm font-medium">{barber.name}</p> : <FormField id="barber-lookup" label={t.inviteDialog.search} hint={t.inviteDialog.searchHint.replace("{count}", String(BARBER_LOOKUP_MIN))} error={errors.barber_id?.message}>
            <SearchInput value={term || undefined} label={t.inviteDialog.search} onCommit={(value) => { form.setValue("term", value ?? ""); form.setValue("barber_id", ""); form.clearErrors("barber_id"); }} />
          </FormField>}
          {term.length >= BARBER_LOOKUP_MIN && lookup.data && results.length === 0 ? <p className="text-sm text-muted-foreground">{BARBER_CONTACT_PATTERN.test(term.trim()) ? t.inviteDialog.contactHint : t.inviteDialog.none}</p> : null}
          {lookup.isError ? <p role="alert" className="text-sm text-destructive">{t.inviteDialog.lookupFailed}</p> : null}
          {results.length > 0 ? (
            <fieldset className="flex flex-col gap-1">
              <legend className="sr-only">{t.inviteDialog.results}</legend>
              {results.map((barber) => (
                <label key={barber.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2 text-sm has-[:checked]:border-primary">
                  <input type="radio" name="barber" value={barber.id} checked={barberId === barber.id} onChange={() => { form.setValue("barber_id", barber.id); form.clearErrors("barber_id"); }} />
                  <span dir="auto">{localizedText(barber.name, locale)}</span>
                </label>
              ))}
            </fieldset>
          ) : null}
          <FormField id="invite-commission" label={t.inviteDialog.commission} hint={t.inviteDialog.commissionHint} error={errors.commission?.message}>
            <Input id="invite-commission" type="number" inputMode="decimal" dir="ltr" min={COMMISSION_MIN} max={COMMISSION_MAX} aria-invalid={Boolean(errors.commission)} aria-describedby={errors.commission ? fieldErrorId("invite-commission") : undefined} {...form.register("commission")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{t.inviteDialog.submit}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
