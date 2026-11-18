"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { CURRENCY_CODE_LENGTH, CURRENCY_NAME_MAX, CURRENCY_SYMBOL_MAX } from "@/config/platform/currency-admin.constant";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSaveCurrency } from "@/hooks/platform/currencies/use-save-currency";
import { applyFormError, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { currencyToForm, formToCurrencyPayload, mapCurrencyFieldName, normalizeCurrencyCode } from "@/lib/platform/currency-form.util";
import { createCurrencyFormSchema } from "@/schemas/platform/currencies/currency-form.zod";
import type { CurrencyFormValues } from "@/types/platform/currencies/currency-form-values.type";
import type { AdminCurrency } from "@/types/platform/currency-admin.type";

/** Adds a currency (the code is chosen once) or edits its names and symbol. */
export function CurrencyFormDialog({ currency, onClose }: { currency?: AdminCurrency; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { currencies: t, common } = dictionary;
  const save = useSaveCurrency();
  const editing = currency !== undefined;
  const schema = useMemo(() => createCurrencyFormSchema(t.form, editing), [t.form, editing]);
  const form = useForm<CurrencyFormValues>({ resolver: zodResolver(schema), defaultValues: currencyToForm(currency) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const invalid = (name: keyof CurrencyFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });
  const codeField = form.register("code", { onChange: (event) => form.setValue("code", normalizeCurrencyCode(event.target.value)) });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: currency?.id, payload: formToCurrencyPayload(values, editing) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, formFailureMessage(failure, t.form), mapCurrencyFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="currency-code" label={t.form.code} hint={editing ? undefined : t.form.codeHint} error={errors.code?.message}>
            <Input id="currency-code" dir="ltr" autoComplete="off" spellCheck={false} maxLength={CURRENCY_CODE_LENGTH} readOnly={editing} {...invalid("code", "currency-code")} {...codeField} />
          </FormField>
          <FormField id="currency-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
            <Input id="currency-name-en" dir="ltr" maxLength={CURRENCY_NAME_MAX} {...invalid("name_en", "currency-name-en")} {...form.register("name_en")} />
          </FormField>
          <FormField id="currency-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
            <Input id="currency-name-ar" dir="rtl" maxLength={CURRENCY_NAME_MAX} {...invalid("name_ar", "currency-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <FormField id="currency-symbol" label={t.form.symbol} error={errors.symbol?.message}>
            <Input id="currency-symbol" dir="auto" maxLength={CURRENCY_SYMBOL_MAX} {...invalid("symbol", "currency-symbol")} {...form.register("symbol")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{editing ? t.form.save : t.form.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
