import { EMPLOYMENT_NONE } from "@/config/ops/job-board.constant";
import { JobPostingStatus } from "@/enums/booking/job-posting-status.enum";
import { createFieldNameMapper } from "@/lib/core/errors/apply-form-error.util";
import { toLocalePair } from "@/lib/core/format/locale-pair.util";
import type { JobPostingBody } from "@/services/api/mutation/jobs/job-board.mutation";
import type { BranchJobPosting } from "@/types/jobs/branch-job-posting.type";
import type { JobPostingFormValues } from "@/types/jobs/job-posting-form-values.type";

export function postingToForm(posting: BranchJobPosting | undefined): JobPostingFormValues {
  const title = toLocalePair(posting?.title);
  const description = toLocalePair(posting?.description);
  const requirements = toLocalePair(posting?.requirements);
  return {
    title_en: title.en,
    title_ar: title.ar,
    description_en: description.en,
    description_ar: description.ar,
    requirements_en: requirements.en,
    requirements_ar: requirements.ar,
    location: posting?.location ?? "",
    employment: posting?.employment_type ?? EMPLOYMENT_NONE,
    status: posting?.status ?? JobPostingStatus.Open,
  };
}

/** Requirements are sent only when one language has text, a blank location or employment type as `null`, and the status only when editing. */
export function formToPostingBody(values: JobPostingFormValues, editing: boolean): JobPostingBody {
  const requirements = { en: values.requirements_en.trim(), ar: values.requirements_ar.trim() };
  const location = values.location.trim();
  return {
    title: { en: values.title_en.trim(), ar: values.title_ar.trim() },
    description: { en: values.description_en.trim(), ar: values.description_ar.trim() },
    requirements: requirements.en !== "" || requirements.ar !== "" ? requirements : null,
    location: location === "" ? null : location,
    employment_type: values.employment === EMPLOYMENT_NONE ? null : values.employment,
    ...(editing ? { status: values.status } : {}),
  };
}

export const mapPostingFieldName = createFieldNameMapper({
  "title.en": "title_en",
  "title.ar": "title_ar",
  "description.en": "description_en",
  "description.ar": "description_ar",
  "requirements.en": "requirements_en",
  "requirements.ar": "requirements_ar",
  location: "location",
  employment_type: "employment",
  status: "status",
});
