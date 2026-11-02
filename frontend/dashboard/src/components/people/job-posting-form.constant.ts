import type { IJobPostingFormInput } from "@/services/api/dashboard/people/types/ijob-posting-form-input.types";

export const JOB_POSTING_FORM_SERVER_FIELD_MAP: Record<
  string,
  keyof IJobPostingFormInput
> = {
  "title.en": "titleEn",
  "title.ar": "titleAr",
  "description.en": "descriptionEn",
  "description.ar": "descriptionAr",
  location: "location",
  employment_type: "employmentType",
  status: "status",
};
