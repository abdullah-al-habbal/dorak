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
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_META_MAX, CONTENT_TEXT_MAX } from "@/config/platform/website-content.constant";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useUpdateContentPage } from "@/hooks/platform/settings/use-website-content";
import { applyFormError } from "@/lib/core/errors/apply-form-error.util";
import { mapApiFormError } from "@/lib/core/errors/map-api-form-error.util";
import { formToPagePayload, mapPageFieldName, pageToForm } from "@/lib/platform/website-content-form.util";
import { createPageFormSchema } from "@/schemas/platform/content/website-content-form.zod";
import type { PageFormValues } from "@/types/platform/content/website-content-form-values.type";
import type { ContentPage } from "@/types/platform/website-content.type";

/** Edits a page's titles and search descriptions. The slug is fixed. */
export function ContentPageDialog({ page, onClose }: { page: ContentPage; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { content: t, common } = dictionary;
  const save = useUpdateContentPage();
  const schema = useMemo(() => createPageFormSchema(t.pageForm), [t.pageForm]);
  const form = useForm<PageFormValues>({ resolver: zodResolver(schema), defaultValues: pageToForm(page) });
  const { errors } = form.formState;
  const busy = form.formState.isSubmitting || save.isPending;
  const invalid = (name: keyof PageFormValues, id: string) => ({ "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? fieldErrorId(id) : undefined });

  const submit = form.handleSubmit(async (values) => {
    try {
      await save.mutateAsync({ id: page.id, payload: formToPagePayload(values) });
      onClose();
    } catch (failure) {
      applyFormError(form, mapApiFormError(failure, t.pageForm.failed, mapPageFieldName));
    }
  });

  return (
    <Dialog open onOpenChange={(open) => (open || busy ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg" data-locale={locale}>
        <DialogHeader>
          <DialogTitle>{t.pageForm.title.replace("{slug}", page.slug)}</DialogTitle>
          <DialogDescription>{t.pageForm.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={errors.root?.message} />
          <FormField id="page-title-en" label={t.pageForm.titleEn} error={errors.title_en?.message}>
            <Input id="page-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} {...invalid("title_en", "page-title-en")} {...form.register("title_en")} />
          </FormField>
          <FormField id="page-title-ar" label={t.pageForm.titleAr} error={errors.title_ar?.message}>
            <Input id="page-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} {...invalid("title_ar", "page-title-ar")} {...form.register("title_ar")} />
          </FormField>
          <FormField id="page-meta-en" label={t.pageForm.metaEn} error={errors.meta_en?.message}>
            <Textarea id="page-meta-en" dir="ltr" maxLength={CONTENT_META_MAX} {...invalid("meta_en", "page-meta-en")} {...form.register("meta_en")} />
          </FormField>
          <FormField id="page-meta-ar" label={t.pageForm.metaAr} error={errors.meta_ar?.message}>
            <Textarea id="page-meta-ar" dir="rtl" maxLength={CONTENT_META_MAX} {...invalid("meta_ar", "page-meta-ar")} {...form.register("meta_ar")} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={busy} loadingLabel={common.loading}>{t.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
