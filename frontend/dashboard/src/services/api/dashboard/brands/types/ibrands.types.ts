import type { z } from "zod";
import type {
  BrandSchema,
  brandFormSchema,
} from "@/services/api/dashboard/brands/schemas/brands.schema";

export type IBrand = z.infer<typeof BrandSchema>;
export type IBrandForm = z.infer<typeof brandFormSchema>;
