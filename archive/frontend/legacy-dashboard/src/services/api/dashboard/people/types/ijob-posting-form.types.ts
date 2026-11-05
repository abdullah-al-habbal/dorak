import type { z } from "zod";
import type { jobPostingFormSchema } from "@/services/api/dashboard/people/schemas/people.schema";

export type IJobPostingForm = z.output<typeof jobPostingFormSchema>;
