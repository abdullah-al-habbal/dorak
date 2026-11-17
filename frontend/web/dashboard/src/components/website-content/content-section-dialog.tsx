"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import type { JSX } from "react";
import { useForm, useWatch } from "react-hook-form";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField, fieldErrorId } from "@/components/common/form-field";
import { SectionBodyPreview } from "@/components/website-content/section-body-preview";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_TEXT_MAX } from "@/config/platform/website-content.constant";
import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useUpdateContentSection } from "@/hooks/platform/settings/use-website-content";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToSectionPayload, mapSectionFieldName, sectionToForm } from "@/lib/platform/website-content-form.util";
import { createSectionFormSchema } from "@/schemas/platform/content/website-content-form.zod";
import type { SectionFormValues } from "@/types/platform/content/website-content-form-values.type";
import type { ContentSection } from "@/types/platform/website-content.type";

/** Edits a section's text and structured content for both languages, with a live preview of the headline. */
export function ContentSectionDialog({ section, onClose }: { section: ContentSection; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { content: t, common } = dictionary;
  const f = t.sectionForm;
  const save = useUpdateContentSection();
  const schema = useMemo(() => createSectionFormSchema(f), [f]);
  const form = useForm<SectionFormValues>({ resolver: zodResolver(schema), defaultValues: sectionToForm(section) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const [bodyEn, bodyAr] = useWatch({ control: form.control, name: ["body_en", "body_ar"] });
  const invalid = (name: keyof SectionFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: section.id, payload: formToSectionPayload(values) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, f.failed, mapSectionFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{f.title.replace("{type}", section.section_type)}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="section-title-en" label={f.titleEn} error={errors.title_en?.message}>
              <Input id="section-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("title_en", "section-title-en")} {...form.register("title_en")} />
            </FormField>
            <FormField id="section-title-ar" label={f.titleAr} error={errors.title_ar?.message}>
              <Input id="section-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} {...invalid("title_ar", "section-title-ar")} {...form.register("title_ar")} />
            </FormField>
            <FormField id="section-sub-en" label={f.subtitleEn} error={errors.subtitle_en?.message}>
              <Input id="section-sub-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("subtitle_en", "section-sub-en")} {...form.register("subtitle_en")} />
            </FormField>
            <FormField id="section-sub-ar" label={f.subtitleAr} error={errors.subtitle_ar?.message}>
              <Input id="section-sub-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} {...invalid("subtitle_ar", "section-sub-ar")} {...form.register("subtitle_ar")} />
            </FormField>
          </div>
          <FormField id="section-body-en" label={f.bodyEn} hint={f.bodyHint} error={errors.body_en?.message}>
            <Textarea id="section-body-en" dir="ltr" spellCheck={false} rows={8} className="font-mono text-xs" {...invalid("body_en", "section-body-en")} {...form.register("body_en")} />
          </FormField>
          <FormField id="section-body-ar" label={f.bodyAr} hint={f.bodyHint} error={errors.body_ar?.message}>
            <Textarea id="section-body-ar" dir="ltr" spellCheck={false} rows={8} className="font-mono text-xs" {...invalid("body_ar", "section-body-ar")} {...form.register("body_ar")} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField id="section-media" label={f.media} error={errors.media_url?.message}>
              <Input id="section-media" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("media_url", "section-media")} {...form.register("media_url")} />
            </FormField>
            <FormField id="section-sort" label={f.sortOrder} error={errors.sort?.message}>
              <Input id="section-sort" inputMode="numeric" dir="ltr" {...invalid("sort", "section-sort")} {...form.register("sort")} />
            </FormField>
            <FormField id="section-audience" label={f.audience} error={errors.universe_visibility?.message}>
              <NativeSelect id="section-audience" {...invalid("universe_visibility", "section-audience")} {...form.register("universe_visibility")}>
                {Object.values(UniverseVisibility).map((value) => (
                  <option key={value} value={value}>{t.pages.audience[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          <SectionBodyPreview label={f.preview} emptyLabel={f.previewEmpty} bodyEn={bodyEn} bodyAr={bodyAr} />
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{t.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
