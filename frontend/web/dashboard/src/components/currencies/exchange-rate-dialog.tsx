"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { useAdminCurrencies } from "@/hooks/platform/currencies/use-admin-currencies";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSaveExchangeRate } from "@/hooks/platform/currencies/use-save-exchange-rate";
import { applyFormError, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToRatePayload, isValidRatePair, mapRateFieldName, resolveRatePair } from "@/lib/platform/currency-form.util";
import { createRateFormSchema } from "@/schemas/platform/currencies/currency-form.zod";
import type { RateFormValues } from "@/types/platform/currencies/currency-form-values.type";

/** Adds a rate for a pair. Rates are a history: the newest one in effect is used, so a correction is a new rate. */
export function ExchangeRateDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t, common } = dictionary;
  const currencies = useAdminCurrencies();
  const save = useSaveExchangeRate();
  const activeCodes = (currencies.data ?? []).filter((currency) => currency.is_active).map((currency) => currency.code);
  const schema = useMemo(() => createRateFormSchema(t.rateForm), [t.rateForm]);
  const form = useForm<RateFormValues>({ resolver: zodResolver(schema), defaultValues: { from: "", to: "", rate: "", effective: "" } });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const [from, to] = useWatch({ control: form.control, name: ["from", "to"] });
  const pair = resolveRatePair({ from, to }, activeCodes);
  const invalid = (name: keyof RateFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    const chosen = resolveRatePair(values, activeCodes);
    if (!isValidRatePair(chosen)) {
      form.setError("to", { message: t.rateForm.samePair });
      return;
    }
    try {
      await save.mutateAsync(formToRatePayload(values, chosen));
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, formFailureMessage(failure, t.rateForm), mapRateFieldName));
    }
  });

  const options = activeCodes.map((code) => <option key={code} value={code}>{code}</option>);

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.rateForm.title}</DialogTitle>
          <DialogDescription>{t.rateForm.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="rate-from" label={t.rateForm.from} error={errors.from?.message}>
              <NativeSelect id="rate-from" value={pair.from} onChange={(event) => form.setValue("from", event.target.value)} {...invalid("from", "rate-from")}>{options}</NativeSelect>
            </FormField>
            <FormField id="rate-to" label={t.rateForm.to} error={errors.to?.message}>
              <NativeSelect id="rate-to" value={pair.to} onChange={(event) => form.setValue("to", event.target.value)} {...invalid("to", "rate-to")}>{options}</NativeSelect>
            </FormField>
          </div>
          <FormField id="rate-ratio" label={t.rateForm.rate} hint={t.rateForm.rateHint.replace("{from}", pair.from).replace("{to}", pair.to)} error={errors.rate?.message}>
            <Input id="rate-ratio" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("rate", "rate-ratio")} {...form.register("rate")} />
          </FormField>
          <FormField id="rate-effective" label={t.rateForm.effective} hint={common.fields.optional} error={errors.effective?.message}>
            <Input id="rate-effective" type="datetime-local" dir="ltr" {...invalid("effective", "rate-effective")} {...form.register("effective")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{t.rateForm.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
