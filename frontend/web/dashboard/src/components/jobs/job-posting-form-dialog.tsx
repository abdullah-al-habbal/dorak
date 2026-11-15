"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { EMPLOYMENT_NONE, EMPLOYMENT_TYPES, JOB_LOCATION_MAX, JOB_TEXT_MAX, JOB_TITLE_MAX, POSTING_STATUSES } from "@/config/job-board.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { JobPostingStatus } from "@/enums/job-posting-status.enum";
import { OverlayKind } from "@/enums/overlay-kind.enum";
import { useDeleteJobPosting } from "@/hooks/use-delete-job-posting";
import { useI18n } from "@/hooks/use-i18n";
import { useOverlay } from "@/hooks/use-overlay";
import { useSaveJobPosting } from "@/hooks/use-save-job-posting";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { JobPostingBody } from "@/services/api/mutation/job-board.mutation";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";

interface JobPostingFormDialogProps {
  branchId: string;
  posting?: BranchJobPosting;
  onClose: () => void;
}

function pair(value: unknown): { en: string; ar: string } {
  const source = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return { en: typeof source.en === "string" ? source.en : "", ar: typeof source.ar === "string" ? source.ar : "" };
}

/** Creates or edits a vacancy. Editing can also close or reopen it; a plan without the job board answers 403. */
export function JobPostingFormDialog({ branchId, posting, onClose }: JobPostingFormDialogProps): JSX.Element {
  const { dictionary } = useI18n();
  const { jobs: t, common } = dictionary;
  const overlay = useOverlay();
  const save = useSaveJobPosting();
  const remove = useDeleteJobPosting(branchId);
  const editing = posting !== undefined;
  const [title, setTitle] = useState(pair(posting?.title));
  const [description, setDescription] = useState(pair(posting?.description));
  const [requirements, setRequirements] = useState(pair(posting?.requirements));
  const [location, setLocation] = useState(posting?.location ?? "");
  const [employment, setEmployment] = useState(posting?.employment_type ?? EMPLOYMENT_NONE);
  const [status, setStatus] = useState<string>(posting?.status ?? JobPostingStatus.Open);
  const [error, setError] = useState<string>();
  const busy = save.isPending || remove.isPending;

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if (!title.en.trim() || !title.ar.trim() || !description.en.trim() || !description.ar.trim()) {
      setError(t.form.required);
      return;
    }
    const hasRequirements = requirements.en.trim() !== "" || requirements.ar.trim() !== "";
    const body: JobPostingBody = {
      title: { en: title.en.trim(), ar: title.ar.trim() },
      description: { en: description.en.trim(), ar: description.ar.trim() },
      requirements: hasRequirements ? { en: requirements.en.trim(), ar: requirements.ar.trim() } : null,
      location: location.trim() === "" ? null : location.trim(),
      employment_type: employment === EMPLOYMENT_NONE ? null : employment,
      ...(editing ? { status } : {}),
    };
    try {
      await save.mutateAsync({ id: posting?.id, payload: { branchId, body } });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Forbidden ? t.form.featureOff : t.form.failed);
    }
  }

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
          <FormErrorBanner message={error} />
          <FormField id="job-title-en" label={t.form.titleEn}>
            <Input id="job-title-en" dir="ltr" maxLength={JOB_TITLE_MAX} value={title.en} onChange={(event) => setTitle({ ...title, en: event.target.value })} />
          </FormField>
          <FormField id="job-title-ar" label={t.form.titleAr}>
            <Input id="job-title-ar" dir="rtl" maxLength={JOB_TITLE_MAX} value={title.ar} onChange={(event) => setTitle({ ...title, ar: event.target.value })} />
          </FormField>
          <FormField id="job-description-en" label={t.form.descriptionEn}>
            <Textarea id="job-description-en" dir="ltr" rows={3} maxLength={JOB_TEXT_MAX} value={description.en} onChange={(event) => setDescription({ ...description, en: event.target.value })} />
          </FormField>
          <FormField id="job-description-ar" label={t.form.descriptionAr}>
            <Textarea id="job-description-ar" dir="rtl" rows={3} maxLength={JOB_TEXT_MAX} value={description.ar} onChange={(event) => setDescription({ ...description, ar: event.target.value })} />
          </FormField>
          <FormField id="job-requirements-en" label={t.form.requirementsEn} hint={common.fields.optional}>
            <Textarea id="job-requirements-en" dir="ltr" rows={2} maxLength={JOB_TEXT_MAX} value={requirements.en} onChange={(event) => setRequirements({ ...requirements, en: event.target.value })} />
          </FormField>
          <FormField id="job-requirements-ar" label={t.form.requirementsAr} hint={common.fields.optional}>
            <Textarea id="job-requirements-ar" dir="rtl" rows={2} maxLength={JOB_TEXT_MAX} value={requirements.ar} onChange={(event) => setRequirements({ ...requirements, ar: event.target.value })} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="job-location" label={t.form.location} hint={common.fields.optional}>
              <Input id="job-location" maxLength={JOB_LOCATION_MAX} value={location} onChange={(event) => setLocation(event.target.value)} />
            </FormField>
            <FormField id="job-employment" label={t.form.employment} hint={common.fields.optional}>
              <NativeSelect id="job-employment" value={employment} onChange={(event) => setEmployment(event.target.value)}>
                <option value={EMPLOYMENT_NONE}>{t.form.employmentNone}</option>
                {EMPLOYMENT_TYPES.map((value) => (
                  <option key={value} value={value}>{t.employmentType[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          {editing ? (
            <FormField id="job-status" label={t.form.status}>
              <NativeSelect id="job-status" value={status} onChange={(event) => setStatus(event.target.value)}>
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
