"use client";

import type { JSX } from "react";

import { ErrorState } from "@/components/common/error-state";
import { PlanFormBody } from "@/components/plans/plan-form-body";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SkeletonRows } from "@/components/ui/skeleton-row";
import { useCurrencies } from "@/hooks/use-currencies";
import { useI18n } from "@/hooks/use-i18n";
import { usePlanFeatureKeys } from "@/hooks/use-plan-feature-keys";
import type { Plan } from "@/types/plans/plan.type";

interface PlanFormDialogProps {
  plan?: Plan;
  onClose: () => void;
}

const LOADING_ROWS = 4;
const LOADING_ROW_CLASS = "h-10";
const LOADING_STACK_CLASS = "gap-3";

/** Create or edit a plan. The currency and feature lists load first so the form never renders half-empty. */
export function PlanFormDialog({ plan, onClose }: PlanFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { plans: t } = dictionary;
  const currencies = useCurrencies();
  const featureKeys = usePlanFeatureKeys();
  const ready = currencies.isSuccess && featureKeys.isSuccess;
  const failed = currencies.isError || featureKeys.isError;
  const retry = (): void => {
    void currencies.refetch();
    void featureKeys.refetch();
  };

  return (
    <Dialog open onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{plan ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        {failed ? <ErrorState title={t.states.formErrorTitle} body={t.states.errorBody} onRetry={retry} /> : null}
        {!failed && !ready ? (
          <SkeletonRows count={LOADING_ROWS} rowClassName={LOADING_ROW_CLASS} className={LOADING_STACK_CLASS} />
        ) : null}
        {ready ? <PlanFormBody plan={plan} currencies={currencies.data} featureKeys={featureKeys.data} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}
