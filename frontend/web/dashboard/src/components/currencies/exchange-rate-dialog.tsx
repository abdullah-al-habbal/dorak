"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { RATE_PATTERN } from "@/config/currency-admin.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { useAdminCurrencies } from "@/hooks/use-admin-currencies";
import { useI18n } from "@/hooks/use-i18n";
import { useSaveExchangeRate } from "@/hooks/use-save-exchange-rate";
import { ApiClientError } from "@/services/api/core/api-client-error";

/** Adds a rate for a pair. Rates are a history: the newest one in effect is used, so a correction is a new rate. */
export function ExchangeRateDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t, common } = dictionary;
  const currencies = useAdminCurrencies();
  const save = useSaveExchangeRate();
  const active = (currencies.data ?? []).filter((currency) => currency.is_active);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rate, setRate] = useState("");
  const [effective, setEffective] = useState("");
  const [error, setError] = useState<string>();
  const fromCode = from || active[0]?.code || "";
  const toCode = to || active.find((currency) => currency.code !== fromCode)?.code || "";

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if (fromCode === "" || toCode === "" || fromCode === toCode) {
      setError(t.rateForm.samePair);
      return;
    }
    if (!RATE_PATTERN.test(rate.trim()) || Number(rate) <= 0) {
      setError(t.rateForm.invalidRate);
      return;
    }
    try {
      await save.mutateAsync({ from_currency_code: fromCode, to_currency_code: toCode, rate_ratio: rate.trim(), ...(effective ? { effective_at: new Date(effective).toISOString() } : {}) });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? t.rateForm.invalid : t.rateForm.failed);
    }
  }

  const options = active.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>);

  return (
    <Dialog open onOpenChange={(open) => (open || save.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.rateForm.title}</DialogTitle>
          <DialogDescription>{t.rateForm.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <div className="grid grid-cols-2 gap-3">
            <FormField id="rate-from" label={t.rateForm.from}>
              <NativeSelect id="rate-from" value={fromCode} onChange={(event) => setFrom(event.target.value)}>{options}</NativeSelect>
            </FormField>
            <FormField id="rate-to" label={t.rateForm.to}>
              <NativeSelect id="rate-to" value={toCode} onChange={(event) => setTo(event.target.value)}>{options}</NativeSelect>
            </FormField>
          </div>
          <FormField id="rate-ratio" label={t.rateForm.rate} hint={t.rateForm.rateHint.replace("{from}", fromCode).replace("{to}", toCode)}>
            <Input id="rate-ratio" inputMode="decimal" dir="ltr" autoComplete="off" value={rate} onChange={(event) => setRate(event.target.value)} />
          </FormField>
          <FormField id="rate-effective" label={t.rateForm.effective} hint={common.fields.optional}>
            <Input id="rate-effective" type="datetime-local" dir="ltr" value={effective} onChange={(event) => setEffective(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={save.isPending} loadingLabel={common.loading}>{t.rateForm.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
