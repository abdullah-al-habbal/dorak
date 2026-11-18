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
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYMENT_NONE, EMPLOYMENT_TYPES, JOB_LOCATION_MAX, JOB_TEXT_MAX, JOB_TITLE_MAX, POSTING_STATUSES } from "@/config/ops/job-board.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { OverlayKind } from "@/enums/ui/overlay-kind.enum";
import { useDeleteJobPosting } from "@/hooks/jobs/use-delete-job-posting";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useOverlay } from "@/hooks/core/state/use-overlay";
import { useSaveJobPosting } from "@/hooks/jobs/use-save-job-posting";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToPostingBody, mapPostingFieldName, postingToForm } from "@/lib/jobs/job-posting-form.util";
import { createJobPostingFormSchema } from "@/schemas/jobs/job-posting-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";
import type { JobPostingFormValues } from "@/types/jobs/job-posting-form-values.type";

interface JobPostingFormDialogProps {
  branchId: string;
  posting?: BranchJobPosting;
  onClose: () => void;
}

/** Creates or edits a vacancy. Editing can also close or reopen it; a plan without the job board answers 403. */
export function JobPostingFormDialog({ branchId, posting, onClose }: JobPostingFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { jobs: t, common } = dictionary;
  const overlay = useOverlay();
  const save = useSaveJobPosting();
  const remove = useDeleteJobPosting(branchId);
  const editing = posting !== undefined;
  const schema = useMemo(() => createJobPostingFormSchema(t.form), [t.form]);
  const form = useForm<JobPostingFormValues>({ resolver: zodResolver(schema), defaultValues: postingToForm(posting) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending || remove.isPending;
  const invalid = (name: keyof JobPostingFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: posting?.id, payload: { branchId, body: formToPostingBody(values, editing) } });
      onClose();
    } catch (failure) {
      const forbidden = failure instanceof ApiClientError && failure.status === HttpStatus.Forbidden;
      applyFormError(form, mapApiFormError(failure, forbidden ? t.form.featureOff : t.form.failed, mapPostingFieldName));
    }
  });

  function confirmDelete(): void {
    if (!posting) return;
    overlay.open({
      kind: OverlayKind.Confirm,
      title: t.confirm.deleteTitle,
      description: t.confirm.deleteBody,
      confirmLabel: t.form.delete,
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync(posting.id);
      },
    });
  }

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? t.form.editTitle : t.form.createTitle}</DialogTitle>
          <DialogDescription>{t.form.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="job-title-en" error={errors.title_en?.message} label={t.form.titleEn}>
            <Input id="job-title-en" dir="ltr" maxLength={JOB_TITLE_MAX} {...invalid("title_en", "job-title-en")} {...form.register("title_en")} />
          </FormField>
          <FormField id="job-title-ar" error={errors.title_ar?.message} label={t.form.titleAr}>
            <Input id="job-title-ar" dir="rtl" maxLength={JOB_TITLE_MAX} {...invalid("title_ar", "job-title-ar")} {...form.register("title_ar")} />
          </FormField>
          <FormField id="job-description-en" error={errors.description_en?.message} label={t.form.descriptionEn}>
            <Textarea id="job-description-en" dir="ltr" rows={3} maxLength={JOB_TEXT_MAX} {...invalid("description_en", "job-description-en")} {...form.register("description_en")} />
          </FormField>
          <FormField id="job-description-ar" error={errors.description_ar?.message} label={t.form.descriptionAr}>
            <Textarea id="job-description-ar" dir="rtl" rows={3} maxLength={JOB_TEXT_MAX} {...invalid("description_ar", "job-description-ar")} {...form.register("description_ar")} />
          </FormField>
          <FormField id="job-requirements-en" error={errors.requirements_en?.message} label={t.form.requirementsEn} hint={common.fields.optional}>
            <Textarea id="job-requirements-en" dir="ltr" rows={2} maxLength={JOB_TEXT_MAX} {...invalid("requirements_en", "job-requirements-en")} {...form.register("requirements_en")} />
          </FormField>
          <FormField id="job-requirements-ar" error={errors.requirements_ar?.message} label={t.form.requirementsAr} hint={common.fields.optional}>
            <Textarea id="job-requirements-ar" dir="rtl" rows={2} maxLength={JOB_TEXT_MAX} {...invalid("requirements_ar", "job-requirements-ar")} {...form.register("requirements_ar")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="job-location" error={errors.location?.message} label={t.form.location} hint={common.fields.optional}>
              <Input id="job-location" maxLength={JOB_LOCATION_MAX} {...invalid("location", "job-location")} {...form.register("location")} />
            </FormField>
            <FormField id="job-employment" error={errors.employment?.message} label={t.form.employment} hint={common.fields.optional}>
              <NativeSelect id="job-employment" {...invalid("employment", "job-employment")} {...form.register("employment")}>
                <option value={EMPLOYMENT_NONE}>{t.form.employmentNone}</option>
                {EMPLOYMENT_TYPES.map((value) => (
                  <option key={value} value={value}>{t.employmentType[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          {editing ? (
            <FormField id="job-status" error={errors.status?.message} label={t.form.status}>
              <NativeSelect id="job-status" {...invalid("status", "job-status")} {...form.register("status")}>
                {POSTING_STATUSES.map((value) => (
                  <option key={value} value={value}>{t.postingStatus[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
          ) : null}
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
