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
import { GATEWAY_CODE_MAX, GATEWAY_CODE_PATTERN, GATEWAY_NAME_MAX, GATEWAY_SETTING_MAX_ROWS, GATEWAY_SORT_MAX } from "@/config/platform/payment-gateway.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { PaymentGatewayDriver } from "@/enums/ui/payment-gateway-driver.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useDeletePaymentGateway, useSavePaymentGateway } from "@/hooks/platform/settings/use-payment-gateways";
import { ApiClientError } from "@/services/api/core/api-client-error";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { PaymentGateway } from "@/types/platform/payment-gateway.type";

interface SettingRow {
  key: string;
  value: string;
}

/** Adds or edits a gateway. Credentials are write-only: they are typed here, sent once and never shown again. */
export function PaymentGatewayFormDialog({ gateway, onClose }: { gateway?: PaymentGateway; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { settings, common } = dictionary;
  const t = settings.gateways;
  const overlay = useOverlay();
  const save = useSavePaymentGateway();
  const remove = useDeletePaymentGateway();
  const editing = gateway !== undefined;
  const [code, setCode] = useState(gateway?.code ?? "");
  const [name, setName] = useState(toLocalePair(gateway?.name));
  const [driver, setDriver] = useState<string>(gateway?.driver ?? PaymentGatewayDriver.Offline);
  const [active, setActive] = useState(gateway?.is_active ?? true);
  const [isDefault, setIsDefault] = useState(gateway?.is_default ?? false);
  const [sortOrder, setSortOrder] = useState(String(gateway?.sort_order ?? 0));
  const [rows, setRows] = useState<SettingRow[]>([]);
  const [error, setError] = useState<string>();
  const busy = save.isPending || remove.isPending;

  function updateRow(index: number, patch: Partial<SettingRow>): void {
    setRows(rows.map((row, position) => (position === index ? { ...row, ...patch } : row)));
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const sort = Number(sortOrder);
    const filled = rows.filter((row) => row.key.trim() !== "");
    if (!GATEWAY_CODE_PATTERN.test(code) || !name.en.trim() || !name.ar.trim()) {
      setError(t.form.required);
      return;
    }
    if (!Number.isInteger(sort) || sort < 0 || sort > GATEWAY_SORT_MAX) {
      setError(t.form.invalidSort);
      return;
    }
    if (new Set(filled.map((row) => row.key.trim())).size !== filled.length) {
      setError(t.form.duplicateKey);
      return;
    }
    try {
      await save.mutateAsync({
        id: gateway?.id,
        payload: {
          code,
          name: { en: name.en.trim(), ar: name.ar.trim() },
          driver,
          is_active: active || isDefault,
          is_default: isDefault,
          sort_order: sort,
          ...(filled.length > 0 ? { gateway_settings: Object.fromEntries(filled.map((row) => [row.key.trim(), row.value])) } : {}),
        },
      });
      setRows([]);
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? t.form.invalid : t.form.failed);
    }
  }

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
          <FormErrorBanner message={error} />
          <FormField id="gateway-code" label={t.form.code} hint={t.form.codeHint}>
            <Input id="gateway-code" dir="ltr" spellCheck={false} autoComplete="off" maxLength={GATEWAY_CODE_MAX} value={code} onChange={(event) => setCode(event.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))} />
          </FormField>
          <FormField id="gateway-name-en" label={t.form.nameEn}>
            <Input id="gateway-name-en" dir="ltr" maxLength={GATEWAY_NAME_MAX} value={name.en} onChange={(event) => setName({ ...name, en: event.target.value })} />
          </FormField>
          <FormField id="gateway-name-ar" label={t.form.nameAr}>
            <Input id="gateway-name-ar" dir="rtl" maxLength={GATEWAY_NAME_MAX} value={name.ar} onChange={(event) => setName({ ...name, ar: event.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="gateway-driver" label={t.form.driver}>
              <NativeSelect id="gateway-driver" value={driver} onChange={(event) => setDriver(event.target.value)}>
                {Object.values(PaymentGatewayDriver).map((value) => (
                  <option key={value} value={value}>{t.driver[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="gateway-sort" label={t.form.sortOrder}>
              <Input id="gateway-sort" inputMode="numeric" dir="ltr" autoComplete="off" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} />
            </FormField>
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">{t.form.credentials}</legend>
            <p className="text-sm text-muted-foreground">
              {gateway && gateway.gateway_setting_keys.length > 0 ? t.form.credentialsKept.replace("{keys}", gateway.gateway_setting_keys.join(", ")) : t.form.credentialsHint}
            </p>
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                <FormField id={`gateway-key-${index}`} label={t.form.settingKey}>
                  <Input id={`gateway-key-${index}`} dir="ltr" spellCheck={false} autoComplete="off" value={row.key} onChange={(event) => updateRow(index, { key: event.target.value })} />
                </FormField>
                <FormField id={`gateway-value-${index}`} label={t.form.settingValue}>
                  <Input id={`gateway-value-${index}`} type="password" dir="ltr" spellCheck={false} autoComplete="new-password" value={row.value} onChange={(event) => updateRow(index, { value: event.target.value })} />
                </FormField>
                <Button type="button" variant="ghost" size="sm" onClick={() => setRows(rows.filter((_, position) => position !== index))}>{t.form.removeSetting}</Button>
              </div>
            ))}
            {rows.length < GATEWAY_SETTING_MAX_ROWS ? (
              <Button type="button" variant="outline" size="sm" className="self-start" onClick={() => setRows([...rows, { key: "", value: "" }])}>{rows.length === 0 && editing ? t.form.replaceSettings : t.form.addSetting}</Button>
            ) : null}
          </fieldset>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={active || isDefault} disabled={isDefault} onChange={(event) => setActive(event.target.checked)} />
            {t.form.active}
          </label>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)} />
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
