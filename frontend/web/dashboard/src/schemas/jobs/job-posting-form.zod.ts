import { z } from "zod";

import { JOB_LOCATION_MAX, JOB_TEXT_MAX, JOB_TITLE_MAX } from "@/config/ops/job-board.constant";
import { nameField } from "@/schemas/fields/name-field.zod";
import type { Dictionary } from "@/types/core/shared/dictionary.type";

export function createJobPostingFormSchema(messages: Dictionary["jobs"]["form"]) {
  return z.object({
    title_en: nameField(JOB_TITLE_MAX, messages.required),
    title_ar: nameField(JOB_TITLE_MAX, messages.required),
    description_en: nameField(JOB_TEXT_MAX, messages.required),
    description_ar: nameField(JOB_TEXT_MAX, messages.required),
    /** Both blank means no requirements. */
    requirements_en: z.string().max(JOB_TEXT_MAX),
    requirements_ar: z.string().max(JOB_TEXT_MAX),
    location: z.string().max(JOB_LOCATION_MAX),
    /** The "none" sentinel or an employment type. */
    employment: z.string(),
    status: z.string(),
  });
}
