import { CONTENT_SORT_MAX, DEFAULT_TESTIMONIAL_RATING } from "@/config/platform/website-content.constant";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { bodyJson, parseBodyObject } from "@/lib/platform/website-content.util";
import type { PagePayload, SectionPayload, TestimonialPayload } from "@/services/api/mutation/platform/website-content.mutation";
import type { PageFormValues, SectionFormValues, TestimonialFormValues } from "@/types/platform/content/website-content-form-values.type";
import type { ContentPage, ContentSection, Testimonial } from "@/types/platform/website-content.type";

/** The order field is typed as text; blank reads as 0, anything but a whole number from 0 to `CONTENT_SORT_MAX` is rejected. */
export function parseSortOrder(value: string): number | undefined {
  const order = Number(value);
  return Number.isInteger(order) && order >= 0 && order <= CONTENT_SORT_MAX ? order : undefined;
}

/** An empty optional text field is sent as `null`. */
function nullIfBlank(value: string): string | null {
  const text = value.trim();
  return text === "" ? null : text;
}

export function pageToForm(page: ContentPage): PageFormValues {
  const title = toLocalePair(page.title);
  const meta = toLocalePair(page.meta_description);
  return { title_en: title.en, title_ar: title.ar, meta_en: meta.en, meta_ar: meta.ar };
}

export function formToPagePayload(values: PageFormValues): PagePayload {
  return {
    title: { en: values.title_en.trim(), ar: values.title_ar.trim() },
    meta_description: { en: values.meta_en.trim(), ar: values.meta_ar.trim() },
  };
}

export const mapPageFieldName = createFieldNameMapper({
  "title.en": "title_en",
  "title.ar": "title_ar",
  "meta_description.en": "meta_en",
  "meta_description.ar": "meta_ar",
});

export function sectionToForm(section: ContentSection): SectionFormValues {
  const title = toLocalePair(section.title);
  const subtitle = toLocalePair(section.subtitle);
  return {
    title_en: title.en,
    title_ar: title.ar,
    subtitle_en: subtitle.en,
    subtitle_ar: subtitle.ar,
    body_en: bodyJson(section.body, "en"),
    body_ar: bodyJson(section.body, "ar"),
    media_url: section.media_url ?? "",
    sort: String(section.sort_order),
    universe_visibility: section.universe_visibility,
  };
}

/** The form is validated first, so both bodies are JSON objects; an unparsable one would be sent as `{}`. */
export function formToSectionPayload(values: SectionFormValues): SectionPayload {
  return {
    title: { en: values.title_en.trim(), ar: values.title_ar.trim() },
    subtitle: { en: values.subtitle_en.trim(), ar: values.subtitle_ar.trim() },
    body: { en: parseBodyObject(values.body_en) ?? {}, ar: parseBodyObject(values.body_ar) ?? {} },
    media_url: nullIfBlank(values.media_url),
    sort_order: parseSortOrder(values.sort) ?? 0,
    universe_visibility: values.universe_visibility,
  };
}

export const mapSectionFieldName = createFieldNameMapper({
  "title.en": "title_en",
  "title.ar": "title_ar",
  "subtitle.en": "subtitle_en",
  "subtitle.ar": "subtitle_ar",
  "body.en": "body_en",
  "body.ar": "body_ar",
  media_url: "media_url",
  sort_order: "sort",
  universe_visibility: "universe_visibility",
});

export function testimonialToForm(testimonial: Testimonial | undefined, defaultSectionId: string): TestimonialFormValues {
  const title = toLocalePair(testimonial?.author_title);
  const body = toLocalePair(testimonial?.body);
  return {
    author_name: testimonial?.author_name ?? "",
    title_en: title.en,
    title_ar: title.ar,
    body_en: body.en,
    body_ar: body.ar,
    section_id: testimonial ? (testimonial.section_id ?? "") : defaultSectionId,
    rating: String(testimonial?.rating ?? DEFAULT_TESTIMONIAL_RATING),
    avatar_url: testimonial?.avatar_url ?? "",
    sort: String(testimonial?.sort_order ?? 0),
  };
}

export function formToTestimonialPayload(values: TestimonialFormValues): TestimonialPayload {
  return {
    section_id: values.section_id === "" ? null : values.section_id,
    author_name: values.author_name.trim(),
    author_title: { en: values.title_en.trim(), ar: values.title_ar.trim() },
    body: { en: values.body_en.trim(), ar: values.body_ar.trim() },
    avatar_url: nullIfBlank(values.avatar_url),
    rating: Number(values.rating),
    sort_order: parseSortOrder(values.sort) ?? 0,
  };
}

export const mapTestimonialFieldName = createFieldNameMapper({
  section_id: "section_id",
  author_name: "author_name",
  "author_title.en": "title_en",
  "author_title.ar": "title_ar",
  "body.en": "body_en",
  "body.ar": "body_ar",
  avatar_url: "avatar_url",
  rating: "rating",
  sort_order: "sort",
});
