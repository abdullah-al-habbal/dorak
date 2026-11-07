"use client";

import type { JSX } from "react";

import { ErrorState } from "@/components/common/error-state";
import { PlanFormBody } from "@/components/plans/plan-form-body";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrencies } from "@/hooks/use-currencies";
import { useI18n } from "@/hooks/use-i18n";
import { usePlanFeatureKeys } from "@/hooks/use-plan-feature-keys";
import type { Plan } from "@/types/plan.type";

interface PlanFormDialogProps {
  plan?: Plan;
  onClose: () => void;
}

const LOADING_ROWS = 4;

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
          <div aria-busy className="flex flex-col gap-3">
            {Array.from({ length: LOADING_ROWS }, (_, index) => <Skeleton key={index} className="h-10 w-full" />)}
          </div>
        ) : null}
        {ready ? <PlanFormBody plan={plan} currencies={currencies.data} featureKeys={featureKeys.data} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}
