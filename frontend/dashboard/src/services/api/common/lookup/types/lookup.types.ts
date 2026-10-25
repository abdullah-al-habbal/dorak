import { z } from "zod";
import {
  LookupOptionSchema,
  LookupResourceSchema,
} from "@/services/api/common/lookup/schemas/lookup.schema";

export type LookupOption = z.infer<typeof LookupOptionSchema>;
export type LookupResource = z.infer<typeof LookupResourceSchema>;
