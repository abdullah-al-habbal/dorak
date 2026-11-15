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
import { CONTENT_SORT_MAX, CONTENT_TEXT_MAX, SECTION_BODY_MAX_BYTES } from "@/config/platform/website-content.constant";
import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import { useI18n } from "@/hooks/core/state/use-i18n";
import { useUpdateContentSection } from "@/hooks/platform/settings/use-website-content";
import { bodyJson, bodyPreview, localeText, parseBodyObject } from "@/lib/platform/website-content.util";
import type { ContentSection } from "@/types/platform/website-content.type";

/** Edits a section's text and structured content for both languages, with a live preview of the headline. */
export function ContentSectionDialog({ section, onClose }: { section: ContentSection; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { content: t, common } = dictionary;
  const f = t.sectionForm;
  const save = useUpdateContentSection();
  const [titleEn, setTitleEn] = useState(localeText(section.title, "en"));
  const [titleAr, setTitleAr] = useState(localeText(section.title, "ar"));
  const [subEn, setSubEn] = useState(localeText(section.subtitle, "en"));
  const [subAr, setSubAr] = useState(localeText(section.subtitle, "ar"));
  const [bodyEn, setBodyEn] = useState(bodyJson(section.body, "en"));
  const [bodyAr, setBodyAr] = useState(bodyJson(section.body, "ar"));
  const [media, setMedia] = useState(section.media_url ?? "");
  const [sort, setSort] = useState(String(section.sort_order));
  const [audience, setAudience] = useState<UniverseVisibility>(section.universe_visibility);
  const [error, setError] = useState<string>();
  const previewEn = parseBodyObject(bodyEn);
  const previewAr = parseBodyObject(bodyAr);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const en = parseBodyObject(bodyEn);
    const ar = parseBodyObject(bodyAr);
    const order = Number(sort);
    if (!en || !ar) {
      setError(f.invalidJson);
      return;
    }
    if (JSON.stringify({ en, ar }).length > SECTION_BODY_MAX_BYTES) {
      setError(f.tooLarge);
      return;
    }
    if (!Number.isInteger(order) || order < 0 || order > CONTENT_SORT_MAX) {
      setError(f.invalidSort);
      return;
    }
    try {
      await save.mutateAsync({
        id: section.id,
        payload: {
          title: { en: titleEn.trim(), ar: titleAr.trim() },
          subtitle: { en: subEn.trim(), ar: subAr.trim() },
          body: { en, ar },
          media_url: media.trim() === "" ? null : media.trim(),
          sort_order: order,
          universe_visibility: audience,
        },
      });
      onClose();
    } catch {
      setError(f.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || save.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{f.title.replace("{type}", section.section_type)}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="section-title-en" label={f.titleEn}>
              <Input id="section-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
            </FormField>
            <FormField id="section-title-ar" label={f.titleAr}>
              <Input id="section-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} value={titleAr} onChange={(event) => setTitleAr(event.target.value)} />
            </FormField>
            <FormField id="section-sub-en" label={f.subtitleEn}>
              <Input id="section-sub-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={subEn} onChange={(event) => setSubEn(event.target.value)} />
            </FormField>
            <FormField id="section-sub-ar" label={f.subtitleAr}>
              <Input id="section-sub-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} value={subAr} onChange={(event) => setSubAr(event.target.value)} />
            </FormField>
          </div>
          <FormField id="section-body-en" label={f.bodyEn} hint={f.bodyHint}>
            <Textarea id="section-body-en" dir="ltr" spellCheck={false} rows={8} className="font-mono text-xs" value={bodyEn} onChange={(event) => setBodyEn(event.target.value)} />
          </FormField>
          <FormField id="section-body-ar" label={f.bodyAr} hint={f.bodyHint}>
            <Textarea id="section-body-ar" dir="ltr" spellCheck={false} rows={8} className="font-mono text-xs" value={bodyAr} onChange={(event) => setBodyAr(event.target.value)} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField id="section-media" label={f.media}>
              <Input id="section-media" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={media} onChange={(event) => setMedia(event.target.value)} />
            </FormField>
            <FormField id="section-sort" label={f.sortOrder}>
              <Input id="section-sort" inputMode="numeric" dir="ltr" value={sort} onChange={(event) => setSort(event.target.value)} />
            </FormField>
            <FormField id="section-audience" label={f.audience}>
              <NativeSelect id="section-audience" value={audience} onChange={(event) => setAudience(Object.values(UniverseVisibility).find((value) => value === event.target.value) ?? UniverseVisibility.All)}>
                {Object.values(UniverseVisibility).map((value) => (
                  <option key={value} value={value}>{t.pages.audience[value]}</option>
                ))}
              </NativeSelect>
            </FormField>
          </div>
          <section aria-label={f.preview} className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-3 sm:grid-cols-2">
            {([["ltr", previewEn], ["rtl", previewAr]] as const).map(([dir, body]) => {
              const preview = body ? bodyPreview(body) : { heading: "", subheading: "" };
              return (
                <div key={dir} dir={dir} className="flex flex-col gap-1">
                  <span className="text-lg font-semibold">{preview.heading || f.previewEmpty}</span>
                  {preview.subheading ? <span className="text-sm text-muted-foreground">{preview.subheading}</span> : null}
                </div>
              );
            })}
          </section>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={save.isPending} loadingLabel={common.loading}>{t.save}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
