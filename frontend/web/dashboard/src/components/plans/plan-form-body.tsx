"use client";

import type { JSX } from "react";
import { Controller } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { PlanFeatureFields } from "@/components/plans/plan-feature-fields";
import { PlanIdentityFields } from "@/components/plans/plan-identity-fields";
import { PlanPricingFields } from "@/components/plans/plan-pricing-fields";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDictionary } from "@/hooks/use-dictionary";
import { usePlanForm } from "@/hooks/use-plan-form";
import type { Currency } from "@/types/platform/currency.type";
import type { Plan } from "@/types/plans/plan.type";

interface PlanFormBodyProps {
  plan?: Plan;
  currencies: readonly Currency[];
  featureKeys: readonly string[];
  onClose: () => void;
}

/** The fields and actions of the plan dialog. */
export function PlanFormBody({ plan, currencies, featureKeys, onClose }: PlanFormBodyProps): JSX.Element {
  const { plans: t, common } = useDictionary();
  const defaultCurrency = currencies.find((currency) => currency.is_default)?.code ?? currencies[0]?.code ?? "";
  const { form, busy, submit, confirmDelete } = usePlanForm(plan, defaultCurrency, onClose);

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <FormErrorBanner message={form.formState.errors.root?.message} />
      <PlanIdentityFields form={form} />
      <PlanPricingFields form={form} currencies={currencies} />
      <PlanFeatureFields form={form} featureKeys={featureKeys} />
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="plan-active">{t.form.active}</Label>
          <p className="text-xs text-muted-foreground">{t.form.activeHint}</p>
        </div>
        <Controller control={form.control} name="is_active" render={({ field }) => <Switch id="plan-active" checked={field.value} onCheckedChange={field.onChange} />} />
      </div>
      <DialogFooter>
        {plan ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{t.form.delete}</Button> : null}
        <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
        <LoadingButton type="submit" loading={busy}>{plan ? t.form.save : t.form.create}</LoadingButton>
      </DialogFooter>
    </form>
  );
}
