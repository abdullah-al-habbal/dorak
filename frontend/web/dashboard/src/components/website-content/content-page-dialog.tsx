"use client";

import { useState } from "react";
import type { FormEvent, JSX } from "react";

import { LoadingButton } from "@/components/buttons/loading-button";
import { FormErrorBanner } from "@/components/common/form-error-banner";
import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CONTENT_META_MAX, CONTENT_TEXT_MAX } from "@/config/website-content.constant";
import { useI18n } from "@/hooks/core/use-i18n";
import { useUpdateContentPage } from "@/hooks/platform/use-website-content";
import { localeText } from "@/lib/platform/website-content.util";
import type { ContentPage } from "@/types/platform/website-content.type";

/** Edits a page's titles and search descriptions. The slug is fixed. */
export function ContentPageDialog({ page, onClose }: { page: ContentPage; onClose: () => void }): JSX.Element {
  const { dictionary, locale } = useI18n();
  const { content: t, common } = dictionary;
  const save = useUpdateContentPage();
  const [titleEn, setTitleEn] = useState(localeText(page.title, "en"));
  const [titleAr, setTitleAr] = useState(localeText(page.title, "ar"));
  const [metaEn, setMetaEn] = useState(localeText(page.meta_description, "en"));
  const [metaAr, setMetaAr] = useState(localeText(page.meta_description, "ar"));
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    if (!titleEn.trim() || !titleAr.trim()) {
      setError(t.pageForm.required);
      return;
    }
    try {
      await save.mutateAsync({ id: page.id, payload: { title: { en: titleEn.trim(), ar: titleAr.trim() }, meta_description: { en: metaEn.trim(), ar: metaAr.trim() } } });
      onClose();
    } catch {
      setError(t.pageForm.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || save.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg" data-locale={locale}>
        <DialogHeader>
          <DialogTitle>{t.pageForm.title.replace("{slug}", page.slug)}</DialogTitle>
          <DialogDescription>{t.pageForm.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="page-title-en" label={t.pageForm.titleEn}>
            <Input id="page-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
          </FormField>
          <FormField id="page-title-ar" label={t.pageForm.titleAr}>
            <Input id="page-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} value={titleAr} onChange={(event) => setTitleAr(event.target.value)} />
          </FormField>
          <FormField id="page-meta-en" label={t.pageForm.metaEn}>
            <Textarea id="page-meta-en" dir="ltr" maxLength={CONTENT_META_MAX} value={metaEn} onChange={(event) => setMetaEn(event.target.value)} />
          </FormField>
          <FormField id="page-meta-ar" label={t.pageForm.metaAr}>
            <Textarea id="page-meta-ar" dir="rtl" maxLength={CONTENT_META_MAX} value={metaAr} onChange={(event) => setMetaAr(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={save.isPending} loadingLabel={common.loading}>{t.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
