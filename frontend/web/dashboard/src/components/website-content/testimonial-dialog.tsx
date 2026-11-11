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
import { AUTHOR_NAME_MAX, CONTENT_SORT_MAX, CONTENT_TEXT_MAX, RATING_VALUES, TESTIMONIAL_BODY_MAX } from "@/config/website-content.constant";
import { HttpStatus } from "@/enums/http-status.enum";
import { useI18n } from "@/hooks/use-i18n";
import { useSaveTestimonial } from "@/hooks/use-website-content";
import { localeText } from "@/lib/website-content.util";
import { ApiClientError } from "@/services/api/core/api-client-error";
import type { ContentSection, Testimonial } from "@/types/website-content.type";

const DEFAULT_RATING = 5;

/** Adds or edits a testimonial and picks the section it appears in. */
export function TestimonialDialog({ testimonial, sections, onClose }: { testimonial?: Testimonial; sections: readonly ContentSection[]; onClose: () => void }): JSX.Element {
  const { dictionary } = useI18n();
  const { content: t, common } = dictionary;
  const f = t.testimonialForm;
  const save = useSaveTestimonial();
  const editing = testimonial !== undefined;
  const testimonialSections = sections.filter((section) => section.section_type === "testimonials");
  const [author, setAuthor] = useState(testimonial?.author_name ?? "");
  const [titleEn, setTitleEn] = useState(localeText(testimonial?.author_title, "en"));
  const [titleAr, setTitleAr] = useState(localeText(testimonial?.author_title, "ar"));
  const [bodyEn, setBodyEn] = useState(localeText(testimonial?.body, "en"));
  const [bodyAr, setBodyAr] = useState(localeText(testimonial?.body, "ar"));
  const [sectionId, setSectionId] = useState(testimonial?.section_id ?? testimonialSections[0]?.id ?? "");
  const [rating, setRating] = useState(testimonial?.rating ?? DEFAULT_RATING);
  const [avatar, setAvatar] = useState(testimonial?.avatar_url ?? "");
  const [sort, setSort] = useState(String(testimonial?.sort_order ?? 0));
  const [error, setError] = useState<string>();

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(undefined);
    const order = Number(sort);
    if (!author.trim() || !bodyEn.trim() || !bodyAr.trim()) {
      setError(f.required);
      return;
    }
    if (!Number.isInteger(order) || order < 0 || order > CONTENT_SORT_MAX) {
      setError(f.invalidSort);
      return;
    }
    try {
      await save.mutateAsync({
        id: testimonial?.id,
        payload: {
          section_id: sectionId === "" ? null : sectionId,
          author_name: author.trim(),
          author_title: { en: titleEn.trim(), ar: titleAr.trim() },
          body: { en: bodyEn.trim(), ar: bodyAr.trim() },
          avatar_url: avatar.trim() === "" ? null : avatar.trim(),
          rating,
          sort_order: order,
        },
      });
      onClose();
    } catch (failure) {
      setError(failure instanceof ApiClientError && failure.status === HttpStatus.Unprocessable ? f.invalid : f.failed);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open || save.isPending ? undefined : onClose())}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto overscroll-contain sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? f.editTitle : f.createTitle}</DialogTitle>
          <DialogDescription>{f.description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <FormErrorBanner message={error} />
          <FormField id="testimonial-author" label={f.author}>
            <Input id="testimonial-author" dir="auto" autoComplete="off" maxLength={AUTHOR_NAME_MAX} value={author} onChange={(event) => setAuthor(event.target.value)} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField id="testimonial-title-en" label={f.titleEn}>
              <Input id="testimonial-title-en" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={titleEn} onChange={(event) => setTitleEn(event.target.value)} />
            </FormField>
            <FormField id="testimonial-title-ar" label={f.titleAr}>
              <Input id="testimonial-title-ar" dir="rtl" maxLength={CONTENT_TEXT_MAX} value={titleAr} onChange={(event) => setTitleAr(event.target.value)} />
            </FormField>
          </div>
          <FormField id="testimonial-body-en" label={f.bodyEn}>
            <Textarea id="testimonial-body-en" dir="ltr" maxLength={TESTIMONIAL_BODY_MAX} value={bodyEn} onChange={(event) => setBodyEn(event.target.value)} />
          </FormField>
          <FormField id="testimonial-body-ar" label={f.bodyAr}>
            <Textarea id="testimonial-body-ar" dir="rtl" maxLength={TESTIMONIAL_BODY_MAX} value={bodyAr} onChange={(event) => setBodyAr(event.target.value)} />
          </FormField>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <FormField id="testimonial-section" label={f.section}>
              <NativeSelect id="testimonial-section" value={sectionId} onChange={(event) => setSectionId(event.target.value)}>
                <option value="">{f.noSection}</option>
                {testimonialSections.map((section) => (
                  <option key={section.id} value={section.id}>{section.section_type} · {section.id.slice(0, 8)}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="testimonial-rating" label={f.rating}>
              <NativeSelect id="testimonial-rating" value={String(rating)} onChange={(event) => setRating(Number(event.target.value))}>
                {RATING_VALUES.map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </NativeSelect>
            </FormField>
            <FormField id="testimonial-sort" label={f.sortOrder}>
              <Input id="testimonial-sort" inputMode="numeric" dir="ltr" value={sort} onChange={(event) => setSort(event.target.value)} />
            </FormField>
          </div>
          <FormField id="testimonial-avatar" label={f.avatar}>
            <Input id="testimonial-avatar" dir="ltr" maxLength={CONTENT_TEXT_MAX} value={avatar} onChange={(event) => setAvatar(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="ghost" disabled={save.isPending} onClick={onClose}>{common.cancel}</Button>
            <LoadingButton type="submit" loading={save.isPending} loadingLabel={common.loading}>{editing ? t.save : f.create}</LoadingButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
