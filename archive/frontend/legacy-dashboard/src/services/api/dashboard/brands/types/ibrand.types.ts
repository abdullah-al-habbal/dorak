import type { z } from "zod";
import type { BrandSchema } from "@/services/api/dashboard/brands/schemas/brands.schema";

export type IBrand = z.infer<typeof BrandSchema>;
