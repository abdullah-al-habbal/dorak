import type { z } from "zod";

import type { createJobPostingFormSchema } from "@/schemas/jobs/job-posting-form.zod";

export type JobPostingFormValues = z.input<ReturnType<typeof createJobPostingFormSchema>>;
