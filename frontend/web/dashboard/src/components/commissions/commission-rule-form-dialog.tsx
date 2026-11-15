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
import { Textarea } from "@/components/ui/textarea";
import { COMMISSION_NOTES_MAX } from "@/config/platform/commission.constant";
import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useBrandOptions } from "@/hooks/brands/owner/use-brand-options";
import { useDeleteCommissionRule, useSaveCommissionRule } from "@/hooks/earnings/use-commissions";
import { useCurrencies } from "@/hooks/platform/currencies/use-currencies";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { bpsToPercent, percentToBps } from "@/lib/earnings/commission.util";
import { minorUnitsToInput, parseMinorUnits } from "@/lib/core/format/money.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { CommissionRulePayload } from "@/services/api/mutation/earnings/commission.mutation";
import type { CommissionRule } from "@/types/earnings/commission.type";

/** Adds or edits a commission rule: where it applies (all, one brand or one branch) and what it charges (a percent or a flat amount). */
export function CommissionRuleFormDialog({ rule, onClose }: { rule?: CommissionRule; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { commissions: t, common } = dictionary;
  const overlay = useOverlay();
  const brands = useBrandOptions();
  const branches = useBranchOptions(true);
  const currencies = useCurrencies();
  const save = useSaveCommissionRule();
  const remove = useDeleteCommissionRule();
  const editing = rule !== undefined;
  const [scope, setScope] = useState<CommissionScope>(rule?.scope ?? CommissionScope.Global);
  const [scopeId, setScopeId] = useState(rule?.scope_id ?? "");
  const [type, setType] = useState<CommissionType>(rule?.type ?? CommissionType.Percent);
  const [percent, setPercent] = useState(rule?.value_bps ? bpsToPercent(rule.value_bps) : "");
  const [amount, setAmount] = useState(rule?.value_amount_minor ? minorUnitsToInput(rule.value_amount_minor) : "");
  const [currency, setCurrency] = useState(rule?.currency?.code ?? "");
  const [active, setActive] = useState(rule?.is_active ?? true);
  const [notes, setNotes] = useState(rule?.notes ?? "");
  const [error, setError] = useState<string>();
  const busy = save.isPending || remove.isPending;
  const targets = scope === CommissionScope.Brand
    ? (brands.data ?? []).map((brand) => ({ id: brand.id, label: localizedText(brand.name, locale) }))
    : (branches.data ?? []).map((branch) => ({ id: branch.id, label: branch.name }));
  const chosenTarget = scopeId || targets[0]?.id || "";
  const chosenCurrency = currency || currencies.data?.[0]?.code || "";

  function buildPayload(): CommissionRulePayload | string {
    const base = { scope, scope_id: scope === CommissionScope.Global ? null : chosenTarget, type, is_active: active, notes: notes.trim() === "" ? null : notes.trim() };
    if (scope !== CommissionScope.Global && chosenTarget === "") return t.form.pickTarget;
    if (type === CommissionType.Percent) {
      const bps = percentToBps(percent);
      return bps === null ? t.form.invalidPercent : { ...base, value_bps: bps };
    }
    const minor = parseMinorUnits(amount);
    if (minor === null || minor < 1 || chosenCurrency === "") return t.form.invalidAmount;
    return { ...base, value_amount_minor: minor, currency_code: chosenCurrency };
  }

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const payload = buildPayload();
    if (typeof payload === "string") {
      setError(payload);
      return;
    }
    try {
      await save.mutateAsync({ id: rule?.id, payload });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? t.form.invalid : t.form.failed);
    }
  }

  function confirmDelete(): void {
    if (!rule) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.form.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(rule.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="rule-scope" label={t.form.scope}>
            <NativeSelect id="rule-scope" value={scope} onChange={(event) => { setScope(event.target.value as CommissionScope); setScopeId(""); }}>
              {Object.values(CommissionScope).map((value) => (
                <option key={value} value={value}>{t.scope[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          {scope === CommissionScope.Global ? null : (
            <FormField id="rule-target" label={scope === CommissionScope.Brand ? t.form.brand : t.form.branch}>
              <NativeSelect id="rule-target" value={chosenTarget} onChange={(event) => setScopeId(event.target.value)}>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>{target.label}</option>
                ))}
              </NativeSelect>
            </FormField>
          )}
          <FormField id="rule-type" label={t.form.type}>
            <NativeSelect id="rule-type" value={type} onChange={(event) => setType(event.target.value as CommissionType)}>
              {Object.values(CommissionType).map((value) => (
                <option key={value} value={value}>{t.type[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          {type === CommissionType.Percent ? (
            <FormField id="rule-percent" label={t.form.percent} hint={t.form.percentHint}>
              <Input id="rule-percent" inputMode="decimal" dir="ltr" autoComplete="off" value={percent} onChange={(event) => setPercent(event.target.value)} />
            </FormField>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FormField id="rule-amount" label={t.form.amount}>
                <Input id="rule-amount" inputMode="decimal" dir="ltr" autoComplete="off" value={amount} onChange={(event) => setAmount(event.target.value)} />
              </FormField>
              <FormField id="rule-currency" label={t.form.currency}>
                <NativeSelect id="rule-currency" value={chosenCurrency} onChange={(event) => setCurrency(event.target.value)}>
                  {currencies.data?.map((value) => (
                    <option key={value.code} value={value.code}>{value.code}</option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>
          )}
          <FormField id="rule-notes" label={t.form.notes} hint={common.fields.optional}>
            <Textarea id="rule-notes" rows={2} maxLength={COMMISSION_NOTES_MAX} value={notes} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" checked={active} onChange={(event) => setActive(event.target.checked)} />
            {t.form.active}
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
