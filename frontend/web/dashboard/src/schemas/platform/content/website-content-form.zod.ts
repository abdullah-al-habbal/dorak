import { z } from "zod";

import { AUTHOR_NAME_MAX, CONTENT_TEXT_MAX, RATING_VALUES, SECTION_BODY_MAX_BYTES, TESTIMONIAL_BODY_MAX } from "@/config/platform/website-content.constant";
import { UniverseVisibility } from "@/enums/people/universe-visibility.enum";
import { parseSortOrder } from "@/lib/platform/website-content-form.util";
import { parseBodyObject } from "@/lib/platform/website-content.util";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

type ContentMessages = Dictionary["content"];

const ratingChoices: readonly string[] = RATING_VALUES.map(String);

export function createPageFormSchema(messages: ContentMessages["pageForm"]) {
  return z.object({
    title_en: nameField(CONTENT_TEXT_MAX, messages.required),
    title_ar: nameField(CONTENT_TEXT_MAX, messages.required),
    meta_en: z.string(),
    meta_ar: z.string(),
  });
}

export function createSectionFormSchema(messages: ContentMessages["sectionForm"]) {
  const bodyField = z.string().refine((text) => parseBodyObject(text) !== undefined, messages.invalidJson);
  return z
    .object({
      title_en: z.string(),
      title_ar: z.string(),
      subtitle_en: z.string(),
      subtitle_ar: z.string(),
      body_en: bodyField,
      body_ar: bodyField,
      media_url: z.string(),
      sort: z.string().refine((text) => parseSortOrder(text) !== undefined, messages.invalidSort),
      universe_visibility: z.enum(UniverseVisibility),
    })
    .refine((values) => JSON.stringify({ en: parseBodyObject(values.body_en), ar: parseBodyObject(values.body_ar) }).length <= SECTION_BODY_MAX_BYTES, {
      message: messages.tooLarge,
      path: ["body_en"],
    });
}

export function createTestimonialFormSchema(messages: ContentMessages["testimonialForm"]) {
  return z.object({
    author_name: nameField(AUTHOR_NAME_MAX, messages.required),
    title_en: z.string(),
    title_ar: z.string(),
    body_en: nameField(TESTIMONIAL_BODY_MAX, messages.required),
    body_ar: nameField(TESTIMONIAL_BODY_MAX, messages.required),
    /** Empty string means "not shown on a page". */
    section_id: z.string(),
    rating: z.string().refine((choice) => ratingChoices.includes(choice), messages.required),
    avatar_url: z.string(),
    sort: z.string().refine((text) => parseSortOrder(text) !== undefined, messages.invalidSort),
  });
}
