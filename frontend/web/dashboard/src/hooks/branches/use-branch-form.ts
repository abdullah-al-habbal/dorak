"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDeleteBranch } from "@/hooks/branches/use-delete-branch";
import { useDictionary } from "@/hooks/core/use-dictionary";
import { useOverlay } from "@/hooks/core/use-overlay";
import { useSaveBranch } from "@/hooks/branches/use-save-branch";
import { branchToForm, emptyBranchForm, formToBranchPayload } from "@/lib/branches/branch-form.util";
import { mapBranchSaveError } from "@/lib/branches/branch-form-error.util";
import { createBranchSchema } from "@/schemas/branch-form.zod";
import type { BranchFormValues } from "@/schemas/branch-form.zod";
import type { BranchDetail } from "@/types/branches/branch-detail.type";

interface BranchFormController {
  form: UseFormReturn<BranchFormValues>;
  busy: boolean;
  submit: () => Promise<void>;
  confirmDelete: () => void;
}

/** Wires the branch form to save and delete. `branch` is the loaded detail when editing; `brandId` pre-selects the brand when creating. */
export function useBranchForm(branch: BranchDetail | undefined, brandId: string, onClose: () => void): BranchFormController {
  const { branches: t } = useDictionary();
  const creating = branch === undefined;
  const overlay = useOverlay();
  const save = useSaveBranch();
  const remove = useDeleteBranch();
  const schema = useMemo(() => createBranchSchema(t.form.validation, creating), [t.form.validation, creating]);
  const form = useForm<BranchFormValues>({ resolver: zodResolver(schema), defaultValues: branch ? branchToForm(branch) : emptyBranchForm(brandId) });
  const busy = form.formState.isSubmitting || save.isPending;

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: branch?.id, payload: formToBranchPayload({ ...values, brand_id: values.brand_id || brandId }) });
      onClose();
    } catch (error) {
      const mapped = mapBranchSaveError(error, t.form.errors);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof BranchFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!branch) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(branch.id);
      },
    });
  }

  return { form, busy, submit, confirmDelete };
}
