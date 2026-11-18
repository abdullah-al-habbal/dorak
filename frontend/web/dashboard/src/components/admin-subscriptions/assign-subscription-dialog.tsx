"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { ErrorState } from "@/components/common/error-state";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NativeSelect } from "@/components/ui/native-select";
import { SkeletonRows } from "@/components/ui/skeleton-row";
import { BrandStatus } from "@/enums/venue/brand-status.enum";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { useAssignSubscription } from "@/hooks/plans/subscriptions/use-assign-subscription";
import { useBrandOptions } from "@/hooks/brands/owner/use-brand-options";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { usePlanOptions } from "@/hooks/plans/use-plan-options";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { localizedText } from "@/lib/core/format/booking-format.util";
import { createAssignSubscriptionFormSchema } from "@/schemas/plans/assign-subscription-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { AssignSubscriptionFormValues } from "@/types/plans/assign-subscription-form-values.type";

const LOADING_ROWS = 2;
const LOADING_ROW_CLASS = "h-10";
const LOADING_STACK_CLASS = "gap-3";

/** Assigns a plan to an approved brand (pending brands are not offered). The backend replaces the brand's current live subscription. */
export function AssignSubscriptionDialog({ onClose }: { onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { adminSubscriptions: t, common } = dictionary;
  const d = t.assignDialog;
  const brands = useBrandOptions(BrandStatus.Active);
  const plans = usePlanOptions();
  const assign = useAssignSubscription();
  const schema = useMemo(() => createAssignSubscriptionFormSchema(d.validation), [d.validation]);
  const form = useForm<AssignSubscriptionFormValues>({ resolver: zodResolver(schema), defaultValues: { brand_id: "", plan_id: "" } });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || assign.isPending;
  const ready = brands.isSuccess && plans.isSuccess;
  const failed = brands.isError || plans.isError;
  const invalid = (name: keyof AssignSubscriptionFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await assign.mutateAsync(values);
      onClose();
    } catch (failure) {
      // A 422 carries the backend's reason (for example an inactive plan) in the request language.
      const reason = failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable && failure.message ? failure.message : d.errors.generic;
      applyFormError(form, mapApiFormError(failure, reason));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{d.title}</DialogTitle>
          <DialogDescription>{d.description}</DialogDescription>
        </DialogHeader>
        {failed ? <ErrorState title={t.states.formErrorTitle} body={t.states.errorBody} onRetry={() => { void brands.refetch(); void plans.refetch(); }} /> : null}
        {!failed && !ready ? (
          <SkeletonRows count={LOADING_ROWS} rowClassName={LOADING_ROW_CLASS} className={LOADING_STACK_CLASS} />
        ) : null}
        {ready ? (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4">
            <FormErrorBanner message={errors.root?.message} />
            {brands.data.length === 0 ? <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{d.noBrands}</p> : null}
            {plans.data.length === 0 ? <p role="status" className="rounded-lg bg-warning/15 px-3 py-2 text-sm">{d.noPlans}</p> : null}
            <FormField id="assign-brand" label={d.brand} error={errors.brand_id?.message}>
              <NativeSelect id="assign-brand" {...invalid("brand_id", "assign-brand")} {...form.register("brand_id")}>
                <option value="">{d.choose}</option>
                {brands.data.map((brand) => (
                  <option key={brand.id} value={brand.id}>{localizedText(brand.name, locale)}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="assign-plan" label={d.plan} error={errors.plan_id?.message}>
              <NativeSelect id="assign-plan" {...invalid("plan_id", "assign-plan")} {...form.register("plan_id")}>
                <option value="">{d.choose}</option>
                {plans.data.map((plan) => (
                  <option key={plan.id} value={plan.id}>{localizedText(plan.name, locale)}</option>
                ))}
              </NativeSelect>
            </FormField>
            <DialogFooter>
              <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{d.back}</Button>
              <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{d.submit}</LoadingButton>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
