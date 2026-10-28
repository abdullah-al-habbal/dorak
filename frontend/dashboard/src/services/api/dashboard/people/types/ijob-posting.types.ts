import type { z } from "zod";
import type { JobPostingSchema } from "@/services/api/dashboard/people/schemas/people.schema";

export type IJobPosting = z.infer<typeof JobPostingSchema>;
