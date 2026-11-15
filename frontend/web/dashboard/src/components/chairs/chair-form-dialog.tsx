"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { CHAIR_MAX_LABEL } from "@/config/venue/chair-layout.constant";
import { ChairStatus } from "@/enums/venue/chair-status.enum";
import { FloorZone } from "@/enums/people/floor-zone.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useBranchOptions } from "@/hooks/branches/use-branch-options";
import { useDeleteChair } from "@/hooks/chairs/use-delete-chair";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useSaveChair } from "@/hooks/chairs/use-save-chair";
import { mapApiFieldErrors } from "@/lib/core/errors/api-field-errors.util";
import { chairToForm, emptyChairForm, formToChairPayload } from "@/lib/chairs/chair-form.util";
import { createChairSchema } from "@/schemas/chairs/chair-form.zod";
import type { ChairFormValues } from "@/schemas/chairs/chair-form.zod";
import { useAuthStore } from "@/store/auth.store";
import type { Chair } from "@/types/chairs/chair.type";

interface ChairFormDialogProps {
  chair?: Chair;
  onClose: () => void;
}

export function ChairFormDialog({ chair, onClose }: ChairFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { chairs: t, common } = dictionary;
  const f = t.form;
  const creating = chair === undefined;
  const overlay = useOverlay();
  const ownBranchId = useAuthStore((state) => state.profile?.branch_id ?? null);
  const branchOptions = useBranchOptions(ownBranchId === null);
  const branches = branchOptions.data ?? [];
  const defaultBranch = ownBranchId ?? branches[0]?.id ?? "";
  const save = useSaveChair();
  const remove = useDeleteChair();
  const schema = useMemo(() => createChairSchema(f.validation), [f.validation]);
  const form = useForm<ChairFormValues>({ resolver: zodResolver(schema), defaultValues: chair ? chairToForm(chair, defaultBranch) : emptyChairForm(defaultBranch) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const chooseBranch = ownBranchId === null && creating;
  const invalid = (name: keyof ChairFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: chair?.id, payload: formToChairPayload({ ...values, branch_id: values.branch_id || defaultBranch }, chair) });
      onClose();
    } catch (error) {
      const mapped = mapApiFieldErrors(error, f.errors.generic);
      for (const [name, message] of Object.entries(mapped.fieldErrors)) form.setError(name as keyof ChairFormValues, { message });
      if (mapped.formError) form.setError("root", { message: mapped.formError });
    }
  });

  function confirmDelete(): void {
    if (!chair) return;
    onClose();
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.confirm.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(chair.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{creating ? f.createTitle : f.editTitle}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="chair-label" label={f.label} error={errors.label?.message}>
            <Input id="chair-label" dir="auto" autoComplete="off" maxLength={CHAIR_MAX_LABEL} {...invalid("label", "chair-label")} {...form.register("label")} />
          </FormField>
          <FormField id="chair-zone" label={f.zone} error={errors.floor_zone?.message}>
            <NativeSelect id="chair-zone" {...form.register("floor_zone")}>
              {Object.values(FloorZone).map((zone) => (
                <option key={zone} value={zone}>{t.zone[zone]}</option>
              ))}
            </NativeSelect>
          </FormField>
          <FormField id="chair-status" label={f.status} hint={f.statusHint} error={errors.status?.message}>
            <NativeSelect id="chair-status" {...form.register("status")}>
              {Object.values(ChairStatus).map((status) => (
                <option key={status} value={status}>{t.status[status]}</option>
              ))}
            </NativeSelect>
          </FormField>
          {chooseBranch ? (
            <FormField id="chair-branch" label={f.branch} error={errors.branch_id?.message}>
              <NativeSelect id="chair-branch" disabled={branchOptions.isPending} {...form.register("branch_id")}>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </NativeSelect>
            </FormField>
          ) : null}
          <DialogFooter>
            {chair ? <Button type="button" variant="ghost" className="me-auto text-destructive" disabled={busy} onClick={confirmDelete}>{f.delete}</Button> : null}
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy}>{creating ? f.create : f.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
