"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { GATEWAY_CODE_MAX, GATEWAY_NAME_MAX, GATEWAY_SETTING_MAX_ROWS } from "@/config/platform/payment-gateway.constant";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { PaymentGatewayDriver } from "@/enums/ui/payment-gateway-driver.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useDeletePaymentGateway, useSavePaymentGateway } from "@/hooks/platform/settings/use-payment-gateways";
import { applyFormError, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToGatewayPayload, gatewayToForm, mapGatewayFieldName, normalizeGatewayCode } from "@/lib/platform/payment-gateway-form.util";
import { createPaymentGatewayFormSchema } from "@/schemas/platform/settings/payment-gateway-form.zod";
import type { PaymentGateway } from "@/types/platform/payment-gateway.type";
import type { PaymentGatewayFormValues } from "@/types/platform/settings/payment-gateway-form-values.type";

/** Adds or edits a gateway. Credentials are write-only: they are typed here, sent once and never shown again. */
export function PaymentGatewayFormDialog({ gateway, onClose }: { gateway?: PaymentGateway; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { settings, common } = dictionary;
  const t = settings.gateways;
  const overlay = useOverlay();
  const save = useSavePaymentGateway();
  const remove = useDeletePaymentGateway();
  const editing = gateway !== undefined;
  const schema = useMemo(() => createPaymentGatewayFormSchema(t.form), [t.form]);
  const form = useForm<PaymentGatewayFormValues>({ resolver: zodResolver(schema), defaultValues: gatewayToForm(gateway) });
  const rows = useFieldArray({ control: form.control, name: "rows" });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending || remove.isPending;
  const [isActive, isDefault] = useWatch({ control: form.control, name: ["is_active", "is_default"] });
  const invalid = (name: keyof PaymentGatewayFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });
  const codeField = form.register("code", { onChange: (event) => form.setValue("code", normalizeGatewayCode(event.target.value)) });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: gateway?.id, payload: formToGatewayPayload(values) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, formFailureMessage(failure, t.form), mapGatewayFieldName));
    }
  });

  function confirmDelete(): void {
    if (!gateway) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.form.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(gateway.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate autoComplete="off" className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="gateway-code" label={t.form.code} hint={t.form.codeHint} error={errors.code?.message}>
            <Input id="gateway-code" dir="ltr" spellCheck={false} autoComplete="off" maxLength={GATEWAY_CODE_MAX} {...invalid("code", "gateway-code")} {...codeField} />
          </FormField>
          <FormField id="gateway-name-en" label={t.form.nameEn} error={errors.name_en?.message}>
            <Input id="gateway-name-en" dir="ltr" maxLength={GATEWAY_NAME_MAX} {...invalid("name_en", "gateway-name-en")} {...form.register("name_en")} />
          </FormField>
          <FormField id="gateway-name-ar" label={t.form.nameAr} error={errors.name_ar?.message}>
            <Input id="gateway-name-ar" dir="rtl" maxLength={GATEWAY_NAME_MAX} {...invalid("name_ar", "gateway-name-ar")} {...form.register("name_ar")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="gateway-driver" label={t.form.driver} error={errors.driver?.message}>
              <NativeSelect id="gateway-driver" {...invalid("driver", "gateway-driver")} {...form.register("driver")}>
                {Object.values(PaymentGatewayDriver).map((value) => (
                  <option key={value} value={value}>{t.driver[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="gateway-sort" label={t.form.sortOrder} error={errors.sort?.message}>
              <Input id="gateway-sort" inputMode="numeric" dir="ltr" autoComplete="off" {...invalid("sort", "gateway-sort")} {...form.register("sort")} />
            </FormField>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{t.form.credentials}</legend>
            <p className="text-sm text-muted-foreground">
              {gateway && gateway.gateway_setting_keys.length > 0 ? t.form.credentialsKept.replace("{keys}", gateway.gateway_setting_keys.join(", ")) : t.form.credentialsHint}
            </p>
            {rows.fields.map((row, index) => (
              <div key={row.id} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <FormField id={`gateway-key-${index}`} label={t.form.settingKey}>
                  <Input id={`gateway-key-${index}`} dir="ltr" spellCheck={false} autoComplete="off" {...form.register(`rows.${index}.key`)} />
                </FormField>
                <FormField id={`gateway-value-${index}`} label={t.form.settingValue}>
                  <Input id={`gateway-value-${index}`} type="password" dir="ltr" spellCheck={false} autoComplete="new-password" {...form.register(`rows.${index}.value`)} />
                </FormField>
                <Button type="button" variant="ghost" size="sm" onClick={() => rows.remove(index)}>{t.form.removeSetting}</Button>
              </div>
            ))}
            {errors.rows?.message ? <p role="alert" className="text-sm text-destructive">{errors.rows.message}</p> : null}
            {rows.fields.length < GATEWAY_SETTING_MAX_ROWS ? (
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => rows.append({ key: "", value: "" })}>{rows.fields.length === 0 && editing ? t.form.replaceSettings : t.form.addSetting}</Button>
            ) : null}
          </fieldset>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={isActive || isDefault} disabled={isDefault} onChange={(event) => form.setValue("is_active", event.target.checked)} />
            {t.form.active}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...form.register("is_default")} />
            {t.form.makeDefault}
          </label>
          <DialogFooter>
            {editing ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{t.form.delete}</Button> : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{editing ? t.form.save : t.form.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
