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
import { Textarea } from "@/components/ui/textarea";
import { COMMISSION_NOTES_MAX } from "@/config/platform/commission.constant";
import { CommissionScope, CommissionType } from "@/enums/money/commission.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useBrandOptions } from "@/hooks/brands/owner/use-brand-options";
import { useDeleteCommissionRule, useSaveCommissionRule } from "@/hooks/earnings/use-commissions";
import { useCurrencies } from "@/hooks/platform/currencies/use-currencies";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { applyFormError, formFailureMessage } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { formToRulePayload, mapRuleFieldName, missingCommissionChoice, resolveCommissionChoices, ruleToForm } from "@/lib/earnings/commission-rule-form.util";
import { createCommissionRuleFormSchema } from "@/schemas/earnings/commission-rule-form.zod";
import type { CommissionRule } from "@/types/earnings/commission.type";
import type { CommissionRuleFormValues } from "@/types/earnings/forms/commission-rule-form-values.type";

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
  const schema = useMemo(() => createCommissionRuleFormSchema(t.form), [t.form]);
  const form = useForm<CommissionRuleFormValues>({ resolver: zodResolver(schema), defaultValues: ruleToForm(rule) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending || remove.isPending;
  const [scope, scopeId, type, currencyCode] = useWatch({ control: form.control, name: ["scope", "scope_id", "type", "currency_code"] });
  const targets = scope === CommissionScope.Brand
    ? (brands.data ?? []).map((brand) => ({ id: brand.id, label: localizedText(brand.name, locale) }))
    : (branches.data ?? []).map((branch) => ({ id: branch.id, label: branch.name }));
  const currencyCodes = (currencies.data ?? []).map((value) => value.code);
  const shown = resolveCommissionChoices({ scope, scope_id: scopeId, currency_code: currencyCode }, targets.map((target) => target.id), currencyCodes);
  const invalid = (name: keyof CommissionRuleFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });
  const scopeField = form.register("scope", { onChange: () => form.setValue("scope_id", "") });

  const submit = form.handleSubmit(async (values) => {
    const choices = resolveCommissionChoices(values, targets.map((target) => target.id), currencyCodes);
    const missing = missingCommissionChoice(values, choices);
    if (missing) {
      form.setError(missing, { message: missing === "scope_id" ? t.form.pickTarget : t.form.invalidAmount });
      return;
    }
    try {
      await save.mutateAsync({ id: rule?.id, payload: formToRulePayload(values, choices) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, formFailureMessage(failure, t.form), mapRuleFieldName));
    }
  });

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
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="rule-scope" label={t.form.scope} error={errors.scope?.message}>
            <NativeSelect id="rule-scope" {...invalid("scope", "rule-scope")} {...scopeField}>
              {Object.values(CommissionScope).map((value) => (
                <option key={value} value={value}>{t.scope[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          {scope === CommissionScope.Global ? null : (
            <FormField id="rule-target" label={scope === CommissionScope.Brand ? t.form.brand : t.form.branch} error={errors.scope_id?.message}>
              <NativeSelect id="rule-target" value={shown.scopeId ?? ""} onChange={(event) => form.setValue("scope_id", event.target.value)} {...invalid("scope_id", "rule-target")}>
                {targets.map((target) => (
                  <option key={target.id} value={target.id}>{target.label}</option>
                ))}
              </NativeSelect>
            </FormField>
          )}
          <FormField id="rule-type" label={t.form.type} error={errors.type?.message}>
            <NativeSelect id="rule-type" {...invalid("type", "rule-type")} {...form.register("type")}>
              {Object.values(CommissionType).map((value) => (
                <option key={value} value={value}>{t.type[value]}</option>
              ))}
            </NativeSelect>
          </FormField>
          {type === CommissionType.Percent ? (
            <FormField id="rule-percent" label={t.form.percent} hint={t.form.percentHint} error={errors.percent?.message}>
              <Input id="rule-percent" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("percent", "rule-percent")} {...form.register("percent")} />
            </FormField>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <FormField id="rule-amount" label={t.form.amount} error={errors.amount?.message}>
                <Input id="rule-amount" inputMode="decimal" dir="ltr" autoComplete="off" {...invalid("amount", "rule-amount")} {...form.register("amount")} />
              </FormField>
              <FormField id="rule-currency" label={t.form.currency} error={errors.currency_code?.message}>
                <NativeSelect id="rule-currency" value={shown.currency} onChange={(event) => form.setValue("currency_code", event.target.value)} {...invalid("currency_code", "rule-currency")}>
                  {currencies.data?.map((value) => (
                    <option key={value.code} value={value.code}>{value.code}</option>
                  ))}
                </NativeSelect>
              </FormField>
            </div>
          )}
          <FormField id="rule-notes" label={t.form.notes} hint={common.fields.optional} error={errors.notes?.message}>
            <Textarea id="rule-notes" rows={2} maxLength={COMMISSION_NOTES_MAX} {...invalid("notes", "rule-notes")} {...form.register("notes")} />
          </FormField>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" className="size-4 accent-primary" {...form.register("is_active")} />
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
