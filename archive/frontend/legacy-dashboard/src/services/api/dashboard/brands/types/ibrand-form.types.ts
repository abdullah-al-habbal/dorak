import type { z } from "zod";
import type { brandFormSchema } from "@/services/api/dashboard/brands/schemas/brands.schema";

export type IBrandForm = z.infer<typeof brandFormSchema>;
