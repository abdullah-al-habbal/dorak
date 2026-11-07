"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { ErrorState } from "@/components/common/error-state";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignSubscription } from "@/hooks/use-assign-subscription";
import { useBrandOptions } from "@/hooks/use-brand-options";
import { useI18n } from "@/hooks/use-i18n";
import { usePlanOptions } from "@/hooks/use-plan-options";
import { localizedText } from "@/lib/booking-format.util";
import { ApiClientError } from "@/services/api/core/api-client-error";

const LOADING_ROWS = 2;
const HTTP_UNPROCESSABLE = 422;

/** Assigns a plan to a brand. The backend replaces the brand's current live subscription. */
export function AssignSubscriptionDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminSubscriptions: t, common } = dictionary;
  const d = t.assignDialog;
  const brands = useBrandOptions();
  const plans = usePlanOptions();
  const assign = useAssignSubscription();
  const [brandId, setBrandId] = useState("");
  const [planId, setPlanId] = useState("");
  const [errors, setErrors] = useState<{ brand?: string; plan?: string; form?: string }>({});
  const ready = brands.isSuccess && plans.isSuccess;
  const failed = brands.isError || plans.isError;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const missing = { brand: brandId ? undefined : d.validation.brand, plan: planId ? undefined : d.validation.plan };
    setErrors(missing);
    if (missing.brand || missing.plan) return;
    try {
      await assign.mutateAsync({ brand_id: brandId, plan_id: planId });
      onClose();
    } catch (failure) {
      // A 422 carries the backend's reason (for example an inactive plan) in the request language.
      setErrors({ form: failure instanceof ApiClientError && failure.status === HTTP_UNPROCESSABLE && failure.message ? failure.message : d.errors.generic });
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || assign.isPending ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{d.title}</DialogTitle>
          <DialogDescription>{d.description}</DialogDescription>
        </DialogHeader>
        {failed ? <ErrorState title={t.states.formErrorTitle} body={t.states.errorBody} onRetry={() => { void brands.refetch(); void plans.refetch(); }} /> : null}
        {!failed && !ready ? (
          <div aria-busy className="flex flex-col gap-3">
            {Array.from({ length: LOADING_ROWS }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}
          </div>
        ) : null}
        {ready ? (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormErrorBanner message={errors.form} />
            {plans.data.length === 0 ? <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{d.noPlans}</p> : null}
            <FormField id="assign-brand" label={d.brand} error={errors.brand}>
              <NativeSelect id="assign-brand" value={brandId} aria-invalid={Boolean(errors.brand)} onChange={(event) => setBrandId(event.target.value)}>
                <option value="">{d.choose}</option>
                {brands.data.map((brand) => (
                  <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="assign-plan" label={d.plan} error={errors.plan}>
              <NativeSelect id="assign-plan" value={planId} aria-invalid={Boolean(errors.plan)} onChange={(event) => setPlanId(event.target.value)}>
                <option value="">{d.choose}</option>
                {plans.data.map((plan) => (
                  <option key={plan.id} value={plan.id}>{localizedText(plan.name, locale)}</option>
                ))}
              </NativeSelect>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="ghost" disabled={assign.isPending} onClick={onClose}>{d.back}</Button>
              <LoadingButton type="submit" loading={assign.isPending} loadingLabel={common.loading}>{d.submit}</LoadingButton>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
