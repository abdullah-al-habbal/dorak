import type { z } from "zod";

import type { jobApplicationSchema } from "@/schemas/job-application.zod";

export type JobApplication = z.infer<typeof jobApplicationSchema>;
