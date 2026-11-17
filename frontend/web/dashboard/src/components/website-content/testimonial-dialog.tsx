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
import { AUTHOR_NAME_MAX, CONTENT_TEXT_MAX, RATING_VALUES, TESTIMONIAL_BODY_MAX } from "@/config/platform/website-content.constant";
import { HttpStatus } from "@/enums/access/http-status.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useSaveTestimonial } from "@/hooks/platform/settings/use-website-content";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToTestimonialPayload, mapTestimonialFieldName, testimonialToForm } from "@/lib/platform/website-content-form.util";
import { createTestimonialFormSchema } from "@/schemas/platform/content/website-content-form.zod";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { TestimonialSectionOption } from "@/types/platform/content/testimonial-section-option.type";
import type { TestimonialFormValues } from "@/types/platform/content/website-content-form-values.type";
import type { Testimonial } from "@/types/platform/website-content.type";

/** Adds or edits a testimonial and picks the section it appears in. */
export function TestimonialDialog({ testimonial, sections, onClose }: { testimonial?: Testimonial; sections: readonly TestimonialSectionOption[]; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { content: t, common } = dictionary;
  const f = t.testimonialForm;
  const save = useSaveTestimonial();
  const editing = testimonial !== undefined;
  const schema = useMemo(() => createTestimonialFormSchema(f), [f]);
  const form = useForm<TestimonialFormValues>({ resolver: zodResolver(schema), defaultValues: testimonialToForm(testimonial, sections[0]?.id ?? "") });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const invalid = (name: keyof TestimonialFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: testimonial?.id, payload: formToTestimonialPayload(values) });
      onClose();
    } catch (failure) {
      const unprocessable = failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable;
      applyFormError(form, mapApiFormError(failure, unprocessable ? f.invalid : f.failed, mapTestimonialFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? f.editTitle : f.createTitle}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="testimonial-author" label={f.author} error={errors.author_name?.message}>
            <Input id="testimonial-author" dir="auto" autoComplete="off" maxLength={AUTHOR_NAME_MAX} {...invalid("author_name", "testimonial-author")} {...form.register("author_name")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="testimonial-title-en" label={f.titleEn} error={errors.title_en?.message}>
              <Input id="testimonial-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("title_en", "testimonial-title-en")} {...form.register("title_en")} />
            </FormField>
            <FormField id="testimonial-title-ar" label={f.titleAr} error={errors.title_ar?.message}>
              <Input id="testimonial-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} {...invalid("title_ar", "testimonial-title-ar")} {...form.register("title_ar")} />
            </FormField>
          </div>
          <FormField id="testimonial-body-en" label={f.bodyEn} error={errors.body_en?.message}>
            <Textarea id="testimonial-body-en" dir="ltr" maxLength={TESTIMONIAL_BODY_MAX} {...invalid("body_en", "testimonial-body-en")} {...form.register("body_en")} />
          </FormField>
          <FormField id="testimonial-body-ar" label={f.bodyAr} error={errors.body_ar?.message}>
            <Textarea id="testimonial-body-ar" dir="rtl" maxLength={TESTIMONIAL_BODY_MAX} {...invalid("body_ar", "testimonial-body-ar")} {...form.register("body_ar")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField id="testimonial-section" label={f.section} error={errors.section_id?.message}>
              <NativeSelect id="testimonial-section" {...invalid("section_id", "testimonial-section")} {...form.register("section_id")}>
                <option value="">{f.noSection}</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>{section.label}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="testimonial-rating" label={f.rating} error={errors.rating?.message}>
              <NativeSelect id="testimonial-rating" {...invalid("rating", "testimonial-rating")} {...form.register("rating")}>
                {RATING_VALUES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="testimonial-sort" label={f.sortOrder} error={errors.sort?.message}>
              <Input id="testimonial-sort" inputMode="numeric" dir="ltr" {...invalid("sort", "testimonial-sort")} {...form.register("sort")} />
            </FormField>
          </div>
          <FormField id="testimonial-avatar" label={f.avatar} error={errors.avatar_url?.message}>
            <Input id="testimonial-avatar" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("avatar_url", "testimonial-avatar")} {...form.register("avatar_url")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{editing ? t.save : f.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
