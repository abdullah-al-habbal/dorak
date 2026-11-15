"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CURRENCY_CODE_LENGTH, CURRENCY_NAME_MAX, CURRENCY_SYMBOL_MAX } from "@/config/platform/currency-admin.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSaveCurrency } from "@/hooks/platform/currencies/use-save-currency";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

function pair(value: AdminCurrency["name"] | undefined): { en: string; ar: string } {
  const source = typeof value === "object" && value !== null ? value : {};
  return { en: source.en ?? "", ar: source.ar ?? "" };
}

/** Adds a currency (the code is chosen once) or edits its names and symbol. */
export function CurrencyFormDialog({ currency, onClose }: { currency?: AdminCurrency; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t, common } = dictionary;
  const save = useSaveCurrency();
  const editing = currency !== undefined;
  const [code, setCode] = useState("");
  const [name, setName] = useState(pair(currency?.name));
  const [symbol, setSymbol] = useState(currency?.symbol ?? "");
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if ((!editing && code.length !== CURRENCY_CODE_LENGTH) || !name.en.trim() || !name.ar.trim() || !symbol.trim()) {
      setError(t.form.required);
      return;
    }
    try {
      await save.mutateAsync({ id: currency?.id, payload: { ...(editing ? {} : { code }), name: { en: name.en.trim(), ar: name.ar.trim() }, symbol: symbol.trim() } });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? t.form.invalid : t.form.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || save.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="currency-code" label={t.form.code} hint={editing ? undefined : t.form.codeHint}>
            <Input id="currency-code" dir="ltr" autoComplete="off" spellCheck={false} maxLength={CURRENCY_CODE_LENGTH} disabled={editing} value={editing ? currency.code : code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z]/g, ""))} />
          </FormField>
          <FormField id="currency-name-en" label={t.form.nameEn}>
            <Input id="currency-name-en" dir="ltr" maxLength={CURRENCY_NAME_MAX} value={name.en} onChange={(event) => setName({ ...name, en: event.target.value })} />
          </FormField>
          <FormField id="currency-name-ar" label={t.form.nameAr}>
            <Input id="currency-name-ar" dir="rtl" maxLength={CURRENCY_NAME_MAX} value={name.ar} onChange={(event) => setName({ ...name, ar: event.target.value })} />
          </FormField>
          <FormField id="currency-symbol" label={t.form.symbol}>
            <Input id="currency-symbol" dir="auto" maxLength={CURRENCY_SYMBOL_MAX} value={symbol} onChange={(event) => setSymbol(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={save.isPending} loadingLabel={common.loading}>{editing ? t.form.save : t.form.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
