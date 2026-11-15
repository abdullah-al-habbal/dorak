"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDeletePlan } from "@/hooks/use-delete-plan";
import { useDictionary } from "@/hooks/use-dictionary";
import { useOverlay } from "@/hooks/use-overlay";
import { useSavePlan } from "@/hooks/use-save-plan";
import { emptyPlanForm, formToPlanPayload, planToForm } from "@/lib/plan-form.util";
import { mapPlanSaveError } from "@/lib/plan-form-error.util";
import { createPlanSchema } from "@/schemas/plan-form.zod";
import type { PlanFormValues } from "@/schemas/plan-form.zod";
import type { Plan } from "@/types/plans/plan.type";

interface PlanFormController {
  form: UseFormReturn<PlanFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
  confirmDelete: () => void;
}

/** Wires the plan form to save and delete. `plan` is the row being edited; `currencyCode` pre-selects the currency when creating. */
export function usePlanForm(plan: Plan | undefined, currencyCode: string, onClose: () => void): PlanFormController {
  const { plans: t } = useDictionary();
  const overlay = useOverlay();
  const save = useSavePlan();
  const remove = useDeletePlan();
  const schema = useMemo(() => createPlanSchema(t.form.validation), [t.form.validation]);
  const form = useForm<PlanFormValues>({ resolver: zodResolver(schema), defaultValues: plan ? planToForm(plan) : emptyPlanForm(currencyCode) });
  const busy = form.formState.isSubmitting || save.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: plan?.id, payload: formToPlanPayload(values) });
      onClose();
    } catch (error) {
      const mapped = mapPlanSaveError(error, t.form.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof PlanFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!plan) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(plan.id);
      },
    });
  }

  return { form, busy, submit, confirmDelete };
}
