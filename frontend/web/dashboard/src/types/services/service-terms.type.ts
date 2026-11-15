import type { z } from "zod";

import type { serviceTermsSchema } from "@/schemas/service-terms.zod";

export type ServiceTerms = z.infer<typeof serviceTermsSchema>;
